import R from 'ramda'

import {Role, ROLES} from '../shared/roles'

interface Phase<S, P> {
  status: S
  players: {
    [playerName: string]: P
  }
  error: string | null
}

type Waiting = Phase<'waiting', {ready: boolean}>
type Started = Phase<
  'firstNight' | 'day' | 'night',
  {
    alive: boolean
    role: Role
  }
>

export type GameState = Waiting | Started

interface Action {
  type: string
  sender: string
  // Other fields carry action payload
  [key: string]: unknown
}

const isAction = (action: any): action is Action =>
  typeof action === 'object' &&
  action !== null &&
  typeof action.type === 'string' &&
  typeof action.sender === 'string'

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

const initialState: GameState = {
  status: 'waiting',
  players: {},
  error: null,
}

export const reducer = (
  state: GameState = initialState,
  action: unknown,
): GameState => {
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
  switch (action.type) {
    case 'JOIN':
      if (cleanState.players[action.sender]) {
        return {
          ...cleanState,
          error: `Player name, ${action.sender}, is already taken`,
        }
      }
      // XXX: `assocPath` can produce invalid state
      return R.assocPath(['players', action.sender], {ready: false}, cleanState)
    case 'LEAVE':
      if (!cleanState.players[action.sender]) {
        return {
          ...cleanState,
          error: `Player, ${action.sender}, does not exist in this game`,
        }
      }
      // XXX: `dissocPath` can produce invalid state
      return R.dissocPath(['players', action.sender], cleanState)
    case 'READY':
      if (cleanState.status !== 'waiting') {
        return {
          ...cleanState,
          error: 'Game has already started',
        }
      }
      if (cleanState.players[action.sender].ready) {
        // Don't change player state if already ready
        return cleanState
      }
      // XXX: `assocPath` can produce invalid state
      const newState = R.assocPath(
        ['players', action.sender, 'ready'],
        true,
        cleanState,
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
      }
    default:
      return {
        ...cleanState,
        error: 'Unknown action type',
      }
  }
}
