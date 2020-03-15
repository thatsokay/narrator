import R from 'ramda'

import {Role, RoleName, ROLES} from './roles'
import {Reducer, Middleware} from '../server/store'

type Phase<S extends string, P, T extends object = {}> = {
  status: S
  players: Record<string, P>
  error: string | null
} & T

type Waiting = Phase<'waiting', {ready: boolean}>
type Day = Phase<
  'day',
  {
    alive: boolean
    role: Role
  }
>
type Night = Phase<
  'firstNight' | 'night',
  {
    alive: boolean
    role: Role
  },
  {awake: RoleName | null}
>

export type GameState = Waiting | Day | Night

type PlainObject = Record<string, unknown>

export interface Action extends PlainObject {
  type: string
  sender?: string
}

// https://github.com/reduxjs/redux/blob/master/src/utils/isPlainObject.ts
export const isPlainObject = (obj: any): obj is PlainObject => {
  if (typeof obj !== 'object' || obj === null) {
    return false
  }

  const proto = Object.getPrototypeOf(obj)
  return !!proto && Object.getPrototypeOf(proto) === null
}

const isAction = (action: PlainObject): action is Action =>
  typeof action.type === 'string' &&
  (typeof action.sender === 'string' || typeof action.sender === 'undefined')

const shuffle = <T>(xs: T[]) => {
  /* Fisher-Yates shuffles an array in place.
   */
  for (let i = xs.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const temp = xs[i]
    xs[i] = xs[j]
    xs[j] = temp
  }
}

export const initialState: GameState = {
  status: 'waiting',
  players: {},
  error: null,
}

const playerReducer: Reducer<GameState, Action> = (
  state = initialState,
  action,
) => {
  if (action === undefined) {
    return state
  }
  if (action.sender === undefined) {
    return state
  }
  switch (state.status) {
    case 'waiting': {
      switch (action.type) {
        case 'JOIN': {
          if (state.players[action.sender]) {
            return {
              ...state,
              error: `Player name, ${action.sender}, is already taken`,
            }
          }
          // XXX: `assocPath` can produce invalid state
          return R.assocPath(['players', action.sender], {ready: false}, state)
        }
        case 'LEAVE': {
          if (!state.players[action.sender]) {
            return {
              ...state,
              error: `Player, ${action.sender}, does not exist in this game`,
            }
          }
          // XXX: `dissocPath` can produce invalid state
          return R.dissocPath(['players', action.sender], state)
        }
        case 'READY': {
          if (state.players[action.sender].ready) {
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
    case 'firstNight': {
      if (state.players[action.sender].role.name !== state.awake) {
        // TODO: Error message
        return state
      }
      switch (state.awake) {
        case 'mafia': {
          if (action.type !== 'ROLE_ACTION') {
            // TODO: Error message
            return state
          }
          // XXX: `assocPath` can produce invalid state
          return R.assocPath(
            [
              'players',
              action.sender,
              'role',
              'actions',
              'firstNight',
              'completed',
            ],
            true,
            state,
          )
        }
        default: {
          // TODO: Other awake states
          return state
        }
      }
    }
    case 'day': {
      if (action.type !== 'ROLE_ACTION') {
        // TODO: Error message
        return state
      }
      if (typeof action.lynch !== 'string' && action.lynch !== null) {
        // TODO: Error message
        return state
      }
      if (action.lynch !== null && !state.players[action.lynch]) {
        // TODO: Error message
        return state
      }
      return R.pipe(
        // XXX: `assocPath` can produce invalid state
        R.assocPath<string | null, GameState>(
          ['players', action.sender, 'role', 'actions', 'day', 'lynch'],
          action.lynch,
        ),
        // XXX: `assocPath` can produce invalid state
        R.assocPath<boolean, GameState>(
          ['players', action.sender, 'role', 'actions', 'day', 'completed'],
          true,
        ),
      )(state)
    }
    default: {
      // TODO: Other phases
      return state
    }
  }
}

export const reducer: Reducer<GameState, PlainObject> = (
  state = initialState,
  action,
) => {
  const cleanState = {...state, error: null}
  if (action === undefined) {
    return cleanState
  }
  if (!isAction(action)) {
    return {
      ...cleanState,
      error: 'Invalid action',
    }
  }
  if (action.sender !== undefined) {
    return playerReducer(cleanState, action)
  }
  switch (action.type) {
    case 'START_GAME': {
      const numPlayers = Object.keys(cleanState.players).length
      // Gives 1 mafia for 6 players, 2 at 8, 3 at 12, and 4 at 18
      const numMafia = Math.floor(Math.sqrt(numPlayers - 5.75) + 0.5) || 1
      // Create array of available roles
      const playerStates = [ROLES.detective, ROLES.nurse]
        .concat(new Array(numMafia).fill(ROLES.mafia))
        .concat(new Array(numPlayers - numMafia - 2).fill(ROLES.villager))
        // Produce a player state for each available role
        .map(role => ({alive: true, role}))
      shuffle(playerStates)
      return {
        status: 'firstNight',
        players: R.zipObj(Object.keys(cleanState.players), playerStates),
        error: null,
        awake: null,
      }
    }
    case 'SLEEP': {
      return {
        ...cleanState,
        awake: null,
      }
    }
    case 'WAKE_MAFIA': {
      return {
        ...cleanState,
        awake: 'mafia',
      }
    }
    case 'PHASE_DAY': {
      if (cleanState.status !== 'firstNight' && cleanState.status !== 'night') {
        return cleanState
      }
      const {awake, ...dayState} = cleanState
      // Reset role action completed state
      const newState = Object.entries(dayState.players)
        .filter(([_, player]) => player.role.actions.firstNight)
        .reduce(
          (state, [name, _]) =>
            // XXX: `assocPath` can produce invalid state
            R.assocPath(
              ['players', name, 'role', 'actions', 'firstNight', 'completed'],
              false,
              state,
            ),
          dayState,
        )
      return {
        ...newState,
        status: 'day',
      }
    }
    case 'PHASE_NIGHT': {
      if (cleanState.status !== 'day') {
        return cleanState
      }
      const newState = Object.entries(cleanState.players)
        .filter(([_, player]) => player.role.actions.day)
        .reduce(
          (state, [name, _]) =>
            // XXX: `assocPath` can produce invalid state
            R.assocPath(
              ['players', name, 'role', 'actions', 'day', 'completed'],
              false,
              state,
            ),
          cleanState,
        )
      return {
        ...newState,
        status: 'night',
        awake: null,
      }
    }
    case 'LYNCH': {
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

const nightRoleOrder = ['mafia', 'detective', 'nurse'] as const
export const middleware: Middleware<
  GameState,
  PlainObject
> = store => next => action => {
  const beforeState = store.getState()
  next(action)
  const afterState = store.getState()

  switch (beforeState.status) {
    case 'waiting': {
      if (action.type !== 'READY') {
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
      next({type: 'START_GAME'})
      setTimeout(() => next({type: 'WAKE_MAFIA'}), 5000)
      return
    }
    case 'firstNight': {
      if (action.type !== 'ROLE_ACTION') {
        return
      }
      if (beforeState.status !== 'firstNight') {
        return
      }
      if (beforeState.awake === null) {
        return
      }
      if (afterState.status !== 'firstNight') {
        return
      }
      if (afterState.awake === null) {
        return
      }
      const phaseComplete = !Object.values(afterState.players).find(
        // Returns true if there exists a living, awake player that has not
        // completed their role action
        ({alive, role}) =>
          alive &&
          role.name === afterState.awake &&
          !role.actions.firstNight?.completed,
      )
      if (!phaseComplete) {
        return
      }
      next({type: 'SLEEP'})
      const aliveRoles = new Set(
        Object.values(afterState.players)
          .filter(({alive, role}) => alive && role.actions.firstNight)
          .map(({role}) => role.name),
      )
      const aliveRoleOrder = nightRoleOrder.filter(role => aliveRoles.has(role))
      // `findIndex` here should never return -1 because currently awake role
      // cannot be dead
      const wakeNextIndex =
        aliveRoleOrder.findIndex(role => role === afterState.awake) + 1
      if (wakeNextIndex < aliveRoleOrder.length) {
        setTimeout(
          () =>
            next({type: `WAKE_${aliveRoleOrder[wakeNextIndex].toUpperCase()}`}),
          5000,
        )
      } else {
        setTimeout(() => next({type: 'PHASE_DAY'}), 5000)
      }
      return
    }
    case 'day': {
      if (action.type !== 'ROLE_ACTION') {
        return
      }
      if (afterState.status !== 'day') {
        return
      }
      const dayComplete = !Object.values(afterState.players).find(
        ({alive, role}) => alive && !role.actions.day?.completed,
      )
      if (!dayComplete) {
        return
      }
      const votes = Object.values(afterState.players)
        .filter(({alive, role}) => alive && role.actions.day)
        .map(({role}) => role.actions.day!.lynch)
      // Assumes empty string is not a possible player name
      const voteCounts = R.countBy(x => x || '', votes)
      const [lynch, count] = Object.entries(voteCounts).reduce(
        R.maxBy<[string, number]>(([_, votes]) => votes),
      )
      if (count <= votes.length / 2) {
        return
      }
      if (lynch) {
        next({type: 'LYNCH', lynch})
      }
      next({type: 'PHASE_NIGHT'})
      setTimeout(() => next({type: 'WAKE_MAFIA'}), 5000)
      return
    }
    default: {
      return
    }
  }
}
