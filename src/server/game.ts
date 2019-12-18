import {Role} from '../shared/roles'

interface Phase<S, P> {
  status: S
  players: {
    [playerName: string]: P
  }
}

type Waiting = Phase<'waiting', {ready: boolean}>
type Started = Phase<
  'firstNight' | 'day' | 'night',
  {
    alive: boolean
    role: Role | null
  }
>

type GameState = Waiting | Started

export interface Game {
  join: (
    playerName: string,
  ) => (
    roomId: string,
    io: SocketIO.Server,
    getPlayers: () => {[playerName: string]: SocketIO.Socket},
  ) => (...args: unknown[]) => void
  leave: (playerName: string) => void
}

export const newGame = (): Game => {
  let gameState: GameState = {
    players: {},
    status: 'waiting',
  }

  const join = (playerName: string) => {
    if (gameState.players[playerName]) {
      throw `Player name ${playerName} is already taken`
    }

    gameState.players[playerName] = {
      ready: false,
    }
    return (
      roomId: string,
      io: SocketIO.Server,
      getPlayers: () => {[playerName: string]: SocketIO.Socket},
    ) => (...args: unknown[]) => {
      if (
        args.length !== 2 ||
        typeof args[0] !== 'object' ||
        typeof args[1] !== 'function' ||
        args[0] === null
      ) {
        return
      }
      const action = args[0] as {[key: string]: unknown}
      const respond = args[1]
      switch (action.type) {
        case 'ready':
          if (gameState.status !== 'waiting') {
            respond({success: false, reason: 'Game has already started'})
            return
          }
          gameState.players[playerName].ready = true
          respond({success: true})
          getPlayers()
            [playerName].to(roomId)
            .emit('gameEvent', {type: 'ready', player: playerName})
          if (
            Object.keys(gameState.players).length >= 6 &&
            !Object.values(gameState.players).filter(({ready}) => !ready).length
          ) {
            gameState = {
              status: 'firstNight',
              players: Object.keys(gameState).reduce(
                (acc, key) => ({
                  ...acc,
                  [key]: {alive: true, role: null},
                }),
                {},
              ),
            }
            console.log('start game')
            io.in(roomId).emit('gameEvent', {type: 'start'})
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
