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

export const newRegistry = () => {
  const sockets: Record<string, string> = {}
  const rooms: Record<string, Room> = {}

  const createRoom = () => {
    /* Create a new empty room and returns its room id. Generates random room
     * ids until an available id is found.
     */
    let roomId = randomRoomId(4)
    while (rooms[roomId] !== undefined) {
      roomId = randomRoomId(4)
    }
    rooms[roomId] = newRoom(roomId)
    return roomId
  }

  const joinRoom = (socketId: string, playerName: string, roomId: string) => {
    /* Adds a player to the room with a given room id if it exists.
     */
    if (sockets[socketId] !== undefined) {
      console.error(socketId, 'attempted to join room when already registered')
      throw 'Already in a room'
    }

    roomId = roomId.toUpperCase()
    const room = rooms[roomId]
    if (!room) {
      console.log(playerName, 'failed to join non-existent room', roomId)
      throw `Room with id ${roomId} does not exist`
    }

    sockets[socketId] = roomId
    console.log(playerName, 'joined room', roomId)
    return room.join(socketId, playerName)
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

export type Registry = ReturnType<typeof newRegistry>
