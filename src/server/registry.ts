import {newRoom, Room} from './room'

const randomRoomId = (length: number) => {
  /* Generates a random string of capital letters of given length.
   */
  let chars = []
  for (let i = 0; i < length; i++) {
    chars.push('ABCDEFGHIJKLMNOPQRSTUVWXYZ'.charAt(Math.random() * 26))
  }
  return chars.join('')
}

export interface Registry {
  createRoom: () => string
  joinRoom: (
    socket: SocketIO.Socket,
    playerName: string,
    roomId: string,
  ) => void
  leave: (socketId: string) => void
}

export const newRegistry = (io: SocketIO.Server): Registry => {
  const sockets: {[socketId: string]: string} = {}
  const rooms: {[roomId: string]: Room} = {}

  const createRoom = () => {
    /* Create a new empty room and returns its room id. Generates random room
     * ids until an available id is found.
     */
    let roomId = randomRoomId(4)
    while (rooms[roomId] !== undefined) {
      roomId = randomRoomId(4)
    }
    rooms[roomId] = newRoom(roomId, io)
    return roomId
  }

  const joinRoom = (socket: SocketIO.Socket, playerName: string, roomId: string) => {
    /* Adds a player to the room with a given room id if it exists.
     */
    if (sockets[socket.id] !== undefined) {
      console.error(socket.id, 'attempted to join room when already registered')
      throw 'Already in a room'
    }

    roomId = roomId.toUpperCase()
    const room = rooms[roomId]
    if (!room) {
      console.log(playerName, 'failed to join non-existent room', roomId)
      throw `Room with id ${roomId} does not exist`
    }

    room.join(socket, playerName)
    sockets[socket.id] = roomId
    console.log(playerName, 'joined room', roomId)
  }

  const leave = (socketId: string) => {
    const roomId = sockets[socketId]
    if (roomId === undefined) {
      return false
    }
    delete sockets[socketId]
    console.log(socketId, 'removed from registry')

    let room = rooms[roomId]
    if (room === undefined) {
      console.error(roomId, 'was in socket registry but not in registry')
      return false
    }
    try {
      room.leave(socketId)
    } catch (error) {
      console.error(error)
      return false
    }
    if (room.isEmpty()) {
      delete rooms[roomId]
      console.log('Removed room', roomId, 'from registry')
    } else {
      rooms[roomId] = room
    }
    return true
  }

  return {createRoom, joinRoom, leave}
}
