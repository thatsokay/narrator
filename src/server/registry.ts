import {EventResponse} from '../shared/types'

const socketRegistry: {[socketId: string]: string} = {}
const roomRegistry: {[roomId: string]: {socketId: string, playerName: string}[]} = {}

export const randomRoomId = (length: number) => {
  /* Generates a random string of capital letters of given length.
   */
  let chars = []
  for (let i = 0; i < length; i++) {
    chars.push('ABCDEFGHIJKLMNOPQRSTUVWXYZ'.charAt(Math.random() * 26))
  }
  return chars.join('')
}

export const createRoom = (
  socketId: string,
  playerName: string,
  ack: (response: EventResponse<{roomId: string}>) => void,
) => {
  /* Create a new room with a single player. Generates random room ids until an
   * available id is found.
   */
  if (socketRegistry[socketId] !== undefined) {
    ack({success: false, reason: 'Already in a room'})
    console.error(socketId, 'attempted to create room when already registered')
    return
  }

  let roomId = randomRoomId(4)
  while (roomRegistry[roomId] !== undefined) {
    roomId = randomRoomId(4)
  }
  socketRegistry[socketId] = roomId
  roomRegistry[roomId] = [{socketId, playerName}]
  ack({success: true, roomId})
  console.log(playerName, 'created room', roomId)
}

export const joinRoom = (
  socketId: string,
  playerName: string,
  roomId: string,
  ack: (response: EventResponse<{}>) => void,
) => {
  /* Adds a player to the room with a given room id if it exists.
   */
  if (socketRegistry[socketId] !== undefined) {
    console.error(socketId, 'attempted to create room when already registered')
    ack({success: false, reason: 'Already in a room'})
    return
  }

  roomId = roomId.toUpperCase()
  const room = roomRegistry[roomId]
  if (room) {
    socketRegistry[socketId] = roomId
    room.push({socketId, playerName})
    ack({success: true})
    console.log(playerName, 'joined room', roomId)
  } else {
    ack({success: false, reason: `Room with id ${roomId} does not exist`})
    console.log(playerName, 'failed to join room', roomId)
  }
}

export const disconnect = (socketId: string) => {
  const roomId = socketRegistry[socketId]
  if (roomId === undefined) {
    return
  }

  let room = roomRegistry[roomId]
  if (room === undefined) {
    console.error(roomId, 'was in socket registry but not in registry')
    return
  }
  room = room.filter(({socketId: sid}) => sid !== socketId)
  if (room === []) {
    delete roomRegistry[roomId]
  } else {
    roomRegistry[roomId] = room
  }
  console.log(socketId, 'removed from registry')
}

export default roomRegistry
