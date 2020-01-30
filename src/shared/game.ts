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
      if (state.status !== 'waiting') {
        return {
          ...state,
          error: 'Game has already started',
        }
      }
      if (state.players[action.sender].ready) {
        // Don't change player state if already ready
        return state
      }
      // XXX: `assocPath` can produce invalid state
      const newState = R.assocPath(
        ['players', action.sender, 'ready'],
        true,
        state,
      )
      if (
        Object.keys(newState.players).length < 6 ||
        Object.values(newState.players).filter(({ready}) => !ready).length
      ) {
        return newState
      }

      // Everyone's ready. Let's go.
      const numPlayers = Object.keys(newState.players).length
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
        players: R.zipObj(Object.keys(newState.players), playerStates),
        error: null,
        awake: null,
      }
    default:
      return {
        ...state,
        error: 'Unknown action type',
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
    case 'WAKE_MAFIA':
      return {
        ...cleanState,
        awake: 'mafia',
      }
    default:
      return {
        ...cleanState,
        error: 'Unknown action type',
      }
  }
}

export const middleware: Middleware<
  GameState,
  PlainObject
> = store => next => action => {
  const beforeState = store.getState()
  next(action)
  const afterState = store.getState()

  if (action.type !== 'READY') {
    return
  }
  if (beforeState.status !== 'waiting') {
    return
  }
  if (afterState.status !== 'firstNight') {
    return
  }
  setTimeout(() => next({type: 'WAKE_MAFIA'}), 5000)
}
