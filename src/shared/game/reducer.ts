import * as R from 'ramda'

import {RootAction, PlayerAction} from './actions'
import {RoleName, RoleStates, ROLES} from '../roles'
import {Reducer, Middleware} from '../../server/store'

type Phase<TStatus extends string, TPlayerState, TFields extends object = {}> =
  {
    status: TStatus
    players: Record<string, TPlayerState>
    error: string | null
  } & TFields

type Waiting = Phase<'waiting', {ready: boolean}>
type Day = Phase<
  'day',
  {
    alive: boolean
    role: RoleStates[keyof RoleStates]
  }
>
type Night = Phase<
  'night',
  {
    alive: boolean
    role: RoleStates[keyof RoleStates]
  },
  {awake: RoleName | null}
>

export type GameState = Waiting | Day | Night

/**
 * Fisher-Yates shuffles an array in place.
 */
const shuffle = <T>(xs: T[]) => {
  for (let i = xs.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const temp = xs[i]!
    xs[i] = xs[j]!
    xs[j] = temp
  }
}

export const initialState: GameState = {
  status: 'waiting',
  players: {},
  error: null,
}

const playerReducer: Reducer<GameState, PlayerAction> = (
  state = initialState,
  action,
) => {
  if (action === undefined) {
    return state
  }
  switch (state.status) {
    case 'waiting': {
      switch (action.type) {
        case 'room/join': {
          if (action.sender in state.players) {
            return {
              ...state,
              error: `Player name, ${action.sender}, is already taken`,
            }
          }
          // XXX: `assocPath` can produce invalid state
          return R.assocPath(['players', action.sender], {ready: false}, state)
        }
        case 'room/leave': {
          if (!(action.sender in state.players)) {
            return {
              ...state,
              error: `Player, ${action.sender}, does not exist in this game`,
            }
          }
          // XXX: `dissocPath` can produce invalid state
          return R.dissocPath(['players', action.sender], state)
        }
        case 'waiting/ready': {
          if (state.players[action.sender]!.ready) {
            // Don't change player state if already ready
            return state
          }
          // XXX: `assocPath` can produce invalid state
          return R.assocPath(['players', action.sender, 'ready'], true, state)
        }
        default: {
          return {
            ...state,
            error: 'Unknown action type',
          }
        }
      }
    }
    case 'day': {
      if (action.type !== 'day/lynch') {
        // TODO: Error message
        return state
      }
      if (typeof action.lynch !== 'string' && action.lynch !== null) {
        // TODO: Error message
        return state
      }
      if (action.lynch !== null && !(action.lynch in state.players)) {
        // TODO: Error message
        return state
      }
      // XXX: `assocPath` can produce invalid state
      return R.assocPath<string | null, GameState>(
        ['players', action.sender, 'role', 'actionStates', 'day', 'lynch'],
        action.lynch,
        state,
      )
    }
    default: {
      // TODO: Other phases
      return state
    }
  }
}

export const reducer: Reducer<GameState, RootAction> = (
  state = initialState,
  action,
) => {
  const cleanState = {...state, error: null}
  if (action === undefined) {
    return cleanState
  }
  if ('sender' in action) {
    return playerReducer(cleanState, action)
  }
  switch (action.type) {
    case 'game/start': {
      const numPlayers = Object.keys(cleanState.players).length
      // Gives 1 mafia for 6 players, 2 at 8, 3 at 12, and 4 at 18
      const numMafia = Math.floor(Math.sqrt(numPlayers - 5.75) + 0.5) || 1
      // Create array of available role states
      const availableRoles: RoleName[] = (['detective', 'nurse'] as const)
        .concat(new Array(numMafia).fill('mafia'))
        .concat(new Array(numPlayers - numMafia - 2).fill('villager'))
      // Produce a player state for each available role
      const playerStates: Night['players'][string][] = availableRoles.map(
        (roleName): Night['players'][string] => ({
          alive: true,
          role: {
            name: roleName,
            actionStates: {},
          },
        }),
      )
      shuffle(playerStates)
      return {
        status: 'night',
        players: R.zipObj(Object.keys(cleanState.players), playerStates),
        error: null,
        awake: null,
      }
    }
    case 'game/sleep': {
      return {
        ...cleanState,
        awake: null,
      }
    }
    case 'game/wake/mafia': {
      return {
        ...cleanState,
        awake: 'mafia',
      }
    }
    case 'game/phase/day': {
      if (cleanState.status !== 'night') {
        return cleanState
      }
      const {awake, ...dayState} = cleanState
      // Reset role action completed state
      const newState: Day = Object.keys(dayState.players).reduce(
        (state, playerName) =>
          // XXX: `assocPath` can produce invalid state
          R.assocPath(
            ['players', playerName, 'role', 'actionStates'],
            {},
            state,
          ),
        {...dayState, status: 'day'},
      )
      return newState
    }
    case 'game/phase/night': {
      if (cleanState.status !== 'day') {
        return cleanState
      }
      const newState: Night = Object.keys(cleanState.players).reduce(
        (state, playerName) =>
          // XXX: `assocPath` can produce invalid state
          R.assocPath(
            ['players', playerName, 'role', 'actionStates'],
            {},
            state,
          ),
        {...cleanState, status: 'night', awake: null},
      )
      return {
        ...newState,
        status: 'night',
        awake: null,
      }
    }
    case 'game/lynch': {
      if (typeof action.lynch !== 'string') {
        return cleanState
      }
      return R.assocPath(['players', action.lynch, 'alive'], false, cleanState)
    }
    default: {
      return {
        ...cleanState,
        error: 'Unknown action type',
      }
    }
  }
}

export const middleware: Middleware<GameState, RootAction> =
  (store) => (next) => (action) => {
    const beforeState = store.getState()
    next(action)
    const afterState = store.getState()

    switch (beforeState.status) {
      case 'waiting': {
        if (action.type !== 'waiting/ready') {
          return
        }
        if (
          Object.keys(afterState.players).length < 6 ||
          Object.values(afterState.players).find(({ready}) => !ready)
        ) {
          // Not enough players or a player isn't ready
          return
        }
        // Everyone's ready. Let's go.
        next({type: 'game/start'})
        setTimeout(() => next({type: 'game/wake/mafia'}), 5000)
        return
      }
      case 'day': {
        if (action.type !== 'day/lynch') {
          return
        }
        if (afterState.status !== 'day') {
          return
        }
        const lynchVoteCounts = countLynchVotes(afterState)
        const voterPopulation = countVoterPopulation(afterState)
        const [lynch, count] = Object.entries(lynchVoteCounts).reduce(
          R.maxBy<[string, number]>(([_, votes]) => votes),
        )
        if (count <= voterPopulation / 2) {
          return
        }
        if (lynch) {
          next({type: 'game/lynch', lynch})
        }
        next({type: 'game/phase/night'})
        setTimeout(() => next({type: 'game/wake/mafia'}), 5000)
        return
      }
      default: {
        return
      }
    }
  }

/**
 * Returns an object mapping player names to the number of lynch votes for them.
 */
export const countLynchVotes = (
  gameState: GameState,
): Record<string, number> => {
  if (gameState.status !== 'day') {
    return {}
  }
  const votes = Object.values(gameState.players)
    .filter(
      ({alive, role}) =>
        alive &&
        // role.actionStates.day?.name === 'lynch' &&
        ROLES[role.name].actions.day === 'lynch' &&
        role.actionStates.day?.lynch,
    )
    .map(({role}) => role.actionStates.day!.lynch)
  // Use empty string to represent `null` lynch vote
  // Assumes empty string is not a possible player name
  return R.countBy((x) => x ?? '', votes)
}

/**
 * Returns the number of players that can currently cast a lynch vote.
 */
export const countVoterPopulation = (gameState: GameState) =>
  gameState.status === 'day'
    ? Object.values(gameState.players).filter(
        ({alive, role}) => alive && ROLES[role.name].actions.day === 'lynch',
      ).length
    : 0
