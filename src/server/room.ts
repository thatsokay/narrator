import {createStore, applyMiddleware} from './store'
import {reducer, middleware} from '../shared/game/reducer'
import {clientAction} from '../shared/game/actions'

export const newRoom = (_roomId: string) => {
  const store = applyMiddleware(middleware)(createStore)(reducer)
  const sockets: Record<string, string> = {}

  const join = (socketId: string, playerName: string) => {
    if (socketId in sockets) {
      throw 'Socket already in room'
    }
    if (Object.values(sockets).includes(playerName)) {
      throw 'Player name is already taken'
    }
    store.dispatch({type: 'room/join', sender: playerName})
    const state = store.getState()
    if (state.error) {
      // Should be unreachable
      throw state.error
    }
    sockets[socketId] = playerName

    const send$ = store.state$
    const receive = (action: unknown) => {
      if (clientAction.guard(action)) {
        store.dispatch({...action, sender: playerName})
      }
    }
    return [send$, receive] as const
  }

  const leave = (socketId: string) => {
    if (!(socketId in sockets)) {
      throw 'Socket not in room'
    }
    store.dispatch({type: 'room/leave', sender: sockets[socketId]!})
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
