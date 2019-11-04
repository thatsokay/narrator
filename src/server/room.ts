import {newGame} from './game'

export interface Room {
  join: (
    socket: SocketIO.Socket,
    playerName: string,
  ) => void
  leave: (socketId: string) => void
  isEmpty: () => boolean
}

export const newRoom = (roomId: string, io: SocketIO.Server): Room => {
  const game = newGame()
  const sockets: {[socketId: string]: string} = {}
  const players: {[playerName: string]: SocketIO.Socket} = {}

  const join = (socket: SocketIO.Socket, playerName: string) => {
    if (sockets[socket.id]) {
      throw 'Socket already in room'
    }
    if (players[playerName]) {
      throw 'Player name is already taken'
    }
    sockets[socket.id] = playerName
    players[playerName] = socket
    socket.join(roomId)
    socket.on('gameEvent', game.join(playerName)(roomId, io))
  }

  const leave = (socketId: string) => {
    if (!sockets[socketId]) {
      throw 'Socket not in room'
    }
    game.leave(sockets[socketId])
    delete players[sockets[socketId]]
    delete sockets[socketId]
  }

  const isEmpty = () => Object.keys(sockets).length === 0

  return {join, leave, isEmpty}
}
