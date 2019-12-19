import {Role, ROLES} from '../shared/roles'

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
    role: Role
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
            Object.keys(gameState.players).length < 6 ||
            Object.values(gameState.players).filter(({ready}) => !ready).length
          ) {
            return
          }

          const numPlayers = Object.keys(gameState.players).length
          // Gives 2 mafia for 8 players, 3 at 12, and 4 at 18
          const numMafia = Math.floor(Math.sqrt(numPlayers - 5.75) + 0.5) || 1
          const availableRoles = [ROLES.detective, ROLES.nurse]
            .concat(new Array(numMafia).fill(ROLES.mafia))
            .concat(new Array(numPlayers - numMafia - 2).fill(ROLES.villager))
          shuffle(availableRoles)
          gameState = {
            status: 'firstNight',
            players: Object.keys(gameState).reduce(
              (acc, key, i) => ({
                ...acc,
                [key]: {alive: true, role: availableRoles[i]},
              }),
              {},
            ),
          }
          console.log('start game')
          io.in(roomId).emit('gameEvent', {type: 'start'})
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
