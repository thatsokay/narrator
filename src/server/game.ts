import {Role} from '../shared/roles'

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

interface Game {
  join: (
    playerName: string,
  ) => (
    roomId: string,
  ) => (socket: SocketIO.Socket, io: SocketIO.Server) => (event: any) => void
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
    return (roomId: string) => (
      // @ts-ignore
      socket: SocketIO.Socket,
      io: SocketIO.Server,
    ) => (event: {type: string}) => {
      if (event.type === 'ready') {
        gameState.players[playerName].ready = true
        if (
          Object.keys(gameState.players).length >= 6 &&
          !Object.values(gameState.players).filter(({ready}) => !ready).length
        ) {
          console.log('start game')
          io.in(roomId).emit('start')
        }
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
