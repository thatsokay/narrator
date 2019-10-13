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
  sockets: {[socketId: string]: string}
  rooms: {[roomId: string]: {socketId: string; playerName: string}[]}
}

export const newRegistry = (): Registry => ({sockets: {}, rooms: {}})

export const createRoom = (
  registry: Registry,
  socketId: string,
  playerName: string,
  ack: (response: EventResponse<{roomId: string}>) => void,
) => {
  /* Create a new room with a single player. Generates random room ids until an
   * available id is found.
   */
  if (registry.sockets[socketId] !== undefined) {
    console.error(socketId, 'attempted to create room when already registered')
    return ack({success: false, reason: 'Already in a room'})
  }

  let roomId = randomRoomId(4)
  while (registry.rooms[roomId] !== undefined) {
    roomId = randomRoomId(4)
  }
  registry.sockets[socketId] = roomId
  registry.rooms[roomId] = [{socketId, playerName}]
  console.log(playerName, 'created room', roomId)
  return ack({success: true, roomId})
}

export const joinRoom = (
  registry: Registry,
  socketId: string,
  playerName: string,
  roomId: string,
  ack: (response: EventResponse<{}>) => void,
) => {
  /* Adds a player to the room with a given room id if it exists.
   */
  if (registry.sockets[socketId] !== undefined) {
    console.error(socketId, 'attempted to join room when already registered')
    return ack({success: false, reason: 'Already in a room'})
  }

  roomId = roomId.toUpperCase()
  const room = registry.rooms[roomId]
  if (!room) {
    console.log(playerName, 'failed to join non-existent room', roomId)
    return ack({
      success: false,
      reason: `Room with id ${roomId} does not exist`,
    })
  }

  // TODO: Check if player name already exists in room
  registry.sockets[socketId] = roomId
  room.push({socketId, playerName})
  console.log(playerName, 'joined room', roomId)
  return ack({success: true})
}

export const disconnect = (registry: Registry, socketId: string) => {
  const roomId = registry.sockets[socketId]
  if (roomId === undefined) {
    return false
  }
  delete registry.sockets[socketId]
  console.log(socketId, 'removed from registry')

  let room = registry.rooms[roomId]
  if (room === undefined) {
    console.error(roomId, 'was in socket registry but not in registry')
    return false
  }
  room = room.filter(({socketId: sid}) => sid !== socketId)
  if (room.length === 0) {
    delete registry.rooms[roomId]
    console.log('Removed room', roomId, 'from registry')
  } else {
    registry.rooms[roomId] = room
  }
  return true
}
