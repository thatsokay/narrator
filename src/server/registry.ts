import {EventResponse} from '../shared/types'

const roomRegistry: {[roomId: string]: string[]} = {}

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
  playerName: string,
  ack: (response: EventResponse<{roomId: string}>) => void,
) => {
  /* Create a new room with a single player. Generates random room ids until an
   * available id is found.
   */
  let roomId = randomRoomId(4)
  while (roomRegistry[roomId] !== undefined) {
    roomId = randomRoomId(4)
  }
  roomRegistry[roomId] = [playerName]
  ack({success: true, roomId})
  console.log(playerName, 'created room', roomId)
}

export const joinRoom = (
  playerName: string,
  roomId: string,
  ack: (response: EventResponse<{}>) => void,
) => {
  /* Adds a player to the room with a given room id if it exists.
   */
  roomId = roomId.toUpperCase()
  const room = roomRegistry[roomId]
  if (room) {
    room.push(playerName)
    ack({success: true})
    console.log(playerName, 'joined room', roomId)
  } else {
    ack({success: false, reason: `Room with id ${roomId} does not exist`})
    console.log(playerName, 'failed to join room', roomId)
  }
}

export default roomRegistry
