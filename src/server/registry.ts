import {newRoom, Room} from './room'
import {EventResponse} from '../shared/types'

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
  createRoom: (
    socketId: string,
    playerName: string,
    ack: (response: EventResponse<{roomId: string}>) => void,
  ) => void
  joinRoom: (
    socketId: string,
    playerName: string,
    roomId: string,
    ack: (response: EventResponse<{}>) => void,
  ) => void
  leave: (socketId: string) => void
}

export const newRegistry = (): Registry => {
  const sockets: {[socketId: string]: string} = {}
  const rooms: {[roomId: string]: Room} = {}

  const createRoom = (
    socketId: string,
    playerName: string,
    ack: (response: EventResponse<{roomId: string}>) => void,
  ) => {
    /* Create a new room with a single player. Generates random room ids until
     * an available id is found.
     */
    if (sockets[socketId] !== undefined) {
      console.error(
        socketId,
        'attempted to create room when already registered',
      )
      ack({success: false, reason: 'Already in a room'})
      return
    }

    let roomId = randomRoomId(4)
    while (rooms[roomId] !== undefined) {
      roomId = randomRoomId(4)
    }
    sockets[socketId] = roomId
    rooms[roomId] = newRoom(socketId, playerName)
    console.log(playerName, 'created room', roomId)
    ack({success: true, roomId})
  }

  const joinRoom = (
    socketId: string,
    playerName: string,
    roomId: string,
    ack: (response: EventResponse<{}>) => void,
  ) => {
    /* Adds a player to the room with a given room id if it exists.
     */
    if (sockets[socketId] !== undefined) {
      console.error(socketId, 'attempted to join room when already registered')
      ack({success: false, reason: 'Already in a room'})
      return
    }

    roomId = roomId.toUpperCase()
    const room = rooms[roomId]
    if (!room) {
      console.log(playerName, 'failed to join non-existent room', roomId)
      ack({
        success: false,
        reason: `Room with id ${roomId} does not exist`,
      })
      return
    }

    // TODO: Check if player name already exists in room
    try {
      room.join(socketId, playerName)
    } catch (error) {
      console.error(error)
      ack({success: false, reason: error})
      return
    }
    sockets[socketId] = roomId
    console.log(playerName, 'joined room', roomId)
    ack({success: true})
    return
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
