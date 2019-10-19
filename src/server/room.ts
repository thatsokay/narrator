import {newGame} from './game'

export interface Room {
  join: (socketId: string, playerName: string) => void
  leave: (socketId: string) => void
  isEmpty: () => boolean
}

export const newRoom = (socketId: string, playerName: string): Room => {
  const game = newGame(playerName)
  const sockets: {[socketId: string]: string} = {[socketId]: playerName}

  const join = (socketId: string, playerName: string) => {
    if (sockets[socketId]) {
      throw 'Socket already in room'
    }
    game.join(playerName)
    sockets[socketId] = playerName
  }

  const leave = (socketId: string) => {
    if (!sockets[socketId]) {
      throw 'Socket not in room'
    }
    game.leave(sockets[socketId])
    delete sockets[socketId]
  }

  const isEmpty = () => Object.keys(sockets).length === 0

  return {join, leave, isEmpty}
}
