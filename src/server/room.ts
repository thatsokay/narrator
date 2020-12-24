import {createStore, applyMiddleware} from './store'
import {reducer, middleware, isPlainObject} from '../shared/game'

export const newRoom = (_roomId: string) => {
  let store = applyMiddleware(middleware)(createStore)(reducer)
  const sockets: Record<string, string> = {}

  const join = (socketId: string, playerName: string) => {
    if (sockets[socketId]) {
      throw 'Socket already in room'
    }
    if (Object.values(sockets).includes(playerName)) {
      throw 'Player name is already taken'
    }
    store.dispatch({type: 'JOIN', sender: playerName})
    const state = store.getState()
    if (state.error) {
      // Should be unreachable
      throw state.error
    }
    sockets[socketId] = playerName

    const send$ = store.state$
    const receive = (action: unknown) => {
      if (isPlainObject(action)) {
        store.dispatch({...action, sender: playerName})
      }
    }
    return [send$, receive] as const
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
    delete sockets[socketId]
  }

  const isEmpty = () => Object.keys(sockets).length === 0

  return {join, leave, isEmpty}
}

export type Room = ReturnType<typeof newRoom>
