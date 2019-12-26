import {createStore} from './store'
import {reducer} from './game'

// @ts-ignore FIXME
export const newRoom = (roomId: string, io: SocketIO.Server) => {
  let store = createStore(reducer)
  const sockets: {[socketId: string]: string} = {}
  const players: {[playerName: string]: SocketIO.Socket} = {}

  const join = (socket: SocketIO.Socket, playerName: string) => {
    if (sockets[socket.id]) {
      throw 'Socket already in room'
    }
    if (players[playerName]) {
      throw 'Player name is already taken'
    }
    store.dispatch({type: 'JOIN', sender: playerName})
    const state = store.getState()
    if (state.error) {
      // Should be unreachable
      throw state.error
    }
    sockets[socket.id] = playerName
    players[playerName] = socket
  }

  const leave = (socketId: string) => {
    if (!sockets[socketId]) {
      throw 'Socket not in room'
    }
    store.dispatch({type: 'LEAVE', sender: sockets[socketId]})
    const state = store.getState()
    if (state.error) {
      // Should be unreachable
      throw state.error
    }
    delete players[sockets[socketId]]
    delete sockets[socketId]
  }

  const isEmpty = () => Object.keys(sockets).length === 0

  return {join, leave, isEmpty}
}

export type Room = ReturnType<typeof newRoom>
