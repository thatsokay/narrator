import {reducer} from './game'

export interface Room {
  join: (socket: SocketIO.Socket, playerName: string) => void
  leave: (socketId: string) => void
  isEmpty: () => boolean
}

// @ts-ignore FIXME
export const newRoom = (roomId: string, io: SocketIO.Server): Room => {
  let gameState = reducer(undefined, undefined)
  const sockets: {[socketId: string]: string} = {}
  const players: {[playerName: string]: SocketIO.Socket} = {}

  const join = (socket: SocketIO.Socket, playerName: string) => {
    if (sockets[socket.id]) {
      throw 'Socket already in room'
    }
    if (players[playerName]) {
      throw 'Player name is already taken'
    }
    gameState = reducer(gameState, {type: 'JOIN', sender: playerName})
    if (gameState.error) {
      // Should be unreachable
      throw gameState.error
    }
    sockets[socket.id] = playerName
    players[playerName] = socket
  }

  const leave = (socketId: string) => {
    if (!sockets[socketId]) {
      throw 'Socket not in room'
    }
    gameState = reducer(gameState, {type: 'LEAVE', sender: sockets[socketId]})
    if (gameState.error) {
      // Should be unreachable
      throw gameState.error
    }
    delete players[sockets[socketId]]
    delete sockets[socketId]
  }

  const isEmpty = () => Object.keys(sockets).length === 0

  return {join, leave, isEmpty}
}
