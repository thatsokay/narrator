import {Role} from '../shared/roles'

interface GameState {
  players: {
    [playerName: string]: {
      alive: boolean
      role: Role | null
    }
  }
  status: 'waiting' | 'firstNight' | 'day' | 'night'
}

interface Game {
  join: (
    playerName: string,
  ) => (roomId: string) => (socket: SocketIO.Socket) => (event: any) => void
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
      alive: true,
      role: null,
    }
    // @ts-ignore
    return (roomId: string) => (socket: SocketIO.Socket) => (event: any) => {
      console.log(event)
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
