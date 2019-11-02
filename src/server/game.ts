import {Role} from '../shared/roles'
import {EventResponse} from '../shared/types'

interface GameState {
  players: {
    [playerName: string]: {
      ready: boolean
      alive: boolean
      role: Role | null
    }
  }
  status: 'waiting' | 'firstNight' | 'day' | 'night'
}

export interface Game {
  join: (
    playerName: string,
  ) => (
    roomId: string,
  ) => (
    io: SocketIO.Server,
  ) => (
    action: {type: string},
    respond: <T>(response: EventResponse<T>) => void,
  ) => void
  leave: (playerName: string) => void
}

export const newGame = (): Game => {
  const gameState: GameState = {
    players: {},
    status: 'waiting',
  }

  const join = (playerName: string) => {
    if (gameState.players[playerName]) {
      throw `Player name ${playerName} is already taken`
    }

    gameState.players[playerName] = {
      ready: false,
      alive: true,
      role: null,
    }
    return (roomId: string) => (io: SocketIO.Server) => (
      action: {type: string},
      respond: <T>(response: EventResponse<T>) => void,
    ) => {
      switch (action.type) {
        case 'ready':
          gameState.players[playerName].ready = true
          respond({success: true})
          if (
            Object.keys(gameState.players).length >= 6 &&
            !Object.values(gameState.players).filter(({ready}) => !ready).length
          ) {
            console.log('start game')
            io.in(roomId).emit('start')
          }
          break
        default:
          respond({success: false, reason: 'Unrecognised action type'})
      }
    }
  }

  const leave = (playerName: string) => {
    if (!gameState.players[playerName]) {
      throw `Player ${playerName} does not exist in this game`
    }
    delete gameState.players[playerName]
  }

  return {join, leave}
}
