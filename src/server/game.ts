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
  join: (playerName: string) => void
  leave: (playerName: string) => void
}

export const newGame = (playerName: string): Game => {
  const gameState: GameState = {
    players: {
      [playerName]: {
        alive: true,
        role: null,
      },
    },
    status: 'waiting'
  }

  const join = (playerName: string) => {
    if (gameState.players[playerName]) {
      throw `Player name ${playerName} is already taken`
    }

    gameState.players[playerName] = {
      alive: true,
      role: null,
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
