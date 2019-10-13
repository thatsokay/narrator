import {EventResponse} from '../shared/types'

const socketRegistry: {[socketId: string]: string} = {}
const roomRegistry: {
  [roomId: string]: {socketId: string; playerName: string}[]
} = {}

const randomRoomId = (length: number) => {
  /* Generates a random string of capital letters of given length.
   */
  let chars = []
  for (let i = 0; i < length; i++) {
    chars.push('ABCDEFGHIJKLMNOPQRSTUVWXYZ'.charAt(Math.random() * 26))
  }
  return chars.join('')
}

export const createRoom = <T>(
  socketId: string,
  playerName: string,
  ack: (response: EventResponse<{roomId: string}>) => T,
): T => {
  /* Create a new room with a single player. Generates random room ids until an
   * available id is found.
   */
  if (socketRegistry[socketId] !== undefined) {
    console.error(socketId, 'attempted to create room when already registered')
    return ack({success: false, reason: 'Already in a room'})
  }

  let roomId = randomRoomId(4)
  while (roomRegistry[roomId] !== undefined) {
    roomId = randomRoomId(4)
  }
  socketRegistry[socketId] = roomId
  roomRegistry[roomId] = [{socketId, playerName}]
  console.log(playerName, 'created room', roomId)
  return ack({success: true, roomId})
}

export const joinRoom = <T>(
  socketId: string,
  playerName: string,
  roomId: string,
  ack: (response: EventResponse<{}>) => T,
): T => {
  /* Adds a player to the room with a given room id if it exists.
   */
  if (socketRegistry[socketId] !== undefined) {
    console.error(socketId, 'attempted to join room when already registered')
    return ack({success: false, reason: 'Already in a room'})
  }

  roomId = roomId.toUpperCase()
  const room = roomRegistry[roomId]
  if (!room) {
    console.log(playerName, 'failed to join non-existent room', roomId)
    return ack({
      success: false,
      reason: `Room with id ${roomId} does not exist`,
    })
  }

  // TODO: Check if player name already exists in room
  socketRegistry[socketId] = roomId
  room.push({socketId, playerName})
  console.log(playerName, 'joined room', roomId)
  return ack({success: true})
}

export const disconnect = (socketId: string) => {
  const roomId = socketRegistry[socketId]
  if (roomId === undefined) {
    return false
  }
  delete socketRegistry[socketId]

  let room = roomRegistry[roomId]
  if (room === undefined) {
    console.error(roomId, 'was in socket registry but not in registry')
    return false
  }
  room = room.filter(({socketId: sid}) => sid !== socketId)
  if (room === []) {
    delete roomRegistry[roomId]
  } else {
    roomRegistry[roomId] = room
  }
  console.log(socketId, 'removed from registry')
  return true
}

export default roomRegistry
