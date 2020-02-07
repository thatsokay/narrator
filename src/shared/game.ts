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

interface Action extends PlainObject {
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
    case 'waiting':
      switch (action.type) {
        case 'JOIN':
          if (state.players[action.sender]) {
            return {
              ...state,
              error: `Player name, ${action.sender}, is already taken`,
            }
          }
          // XXX: `assocPath` can produce invalid state
          return R.assocPath(['players', action.sender], {ready: false}, state)
        case 'LEAVE':
          if (!state.players[action.sender]) {
            return {
              ...state,
              error: `Player, ${action.sender}, does not exist in this game`,
            }
          }
          // XXX: `dissocPath` can produce invalid state
          return R.dissocPath(['players', action.sender], state)
        case 'READY':
          if (state.players[action.sender].ready) {
            // Don't change player state if already ready
            return state
          }
          // XXX: `assocPath` can produce invalid state
          return R.assocPath(['players', action.sender, 'ready'], true, state)
        default:
          return {
            ...state,
            error: 'Unknown action type',
          }
      }
    case 'firstNight':
      if (state.players[action.sender].role.name !== state.awake) {
        // TODO: Error message
        return state
      }
      switch (state.awake) {
        case 'mafia':
          if (action.type !== 'ROLE_ACTION') {
            // TODO: Error message
            return state
          }
          if (action.roleAction !== 'inform') {
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
        default:
          // TODO: Other awake states
          return state
      }
    default:
      // TODO: Other phases
      return state
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
    case 'START_GAME':
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
    case 'SLEEP':
      return {
        ...cleanState,
        awake: null,
      }
    case 'WAKE_MAFIA':
      return {
        ...cleanState,
        awake: 'mafia',
      }
    case 'PHASE_DAY':
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
    default:
      return {
        ...cleanState,
        error: 'Unknown action type',
      }
  }
}

const nightRoleOrder: Readonly<RoleName[]> = Object.freeze([
  'mafia',
  'detective',
  'nurse',
])
export const middleware: Middleware<
  GameState,
  PlainObject
> = store => next => action => {
  const beforeState = store.getState()
  next(action)
  const afterState = store.getState()

  switch (beforeState.status) {
    case 'waiting':
      if (action.type !== 'READY') {
        return
      }
      if (
        Object.keys(afterState.players).length < 6 ||
        Object.values(afterState.players).filter(({ready}) => !ready).length
      ) {
        // Not enough players or a player isn't ready
        return
      }
      // Everyone's ready. Let's go.
      next({type: 'START_GAME'})
      setTimeout(() => next({type: 'WAKE_MAFIA'}), 5000)
      return
    case 'firstNight':
      if (action.type !== 'ROLE_ACTION') {
        return
      }
      // Required because typescript can't narrow generic unions
      // https://github.com/Microsoft/TypeScript/issues/20375
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
      const phaseComplete = Object.values(afterState.players)
        .filter(({alive, role}) => alive && role.name === afterState.awake)
        // Reduce to true if all relevant actions are completed
        .reduce(
          (acc, {role}) => acc && !!role.actions.firstNight?.completed,
          true,
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
    default:
      return
  }
}
