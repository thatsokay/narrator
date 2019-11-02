import {newGame} from './game'
import {EventResponse} from '../shared/types'

export interface Room {
  join: (
    socketId: string,
    playerName: string,
  ) => (
    roomId: string,
  ) => (
    io: SocketIO.Server,
  ) => (
    action: {type: string},
    ack: <T>(response: EventResponse<T>) => void,
  ) => void
  leave: (socketId: string) => void
  isEmpty: () => boolean
}

export const newRoom = (): Room => {
  const game = newGame()
  const sockets: {[socketId: string]: string} = {}

  const join = (socketId: string, playerName: string) => {
    if (sockets[socketId]) {
      throw 'Socket already in room'
    }
    sockets[socketId] = playerName
    return game.join(playerName)
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
