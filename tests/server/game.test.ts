import R from 'ramda'

import {
  GameState,
  reducer,
  isPlainObject,
  middleware,
} from '../../src/shared/game'
import {roleCreator} from '../../src/shared/roles'
import {createStore, applyMiddleware, Middleware} from '../../src/server/store'

const initialState = Object.freeze(reducer())

describe('game', () => {
  test('plain object type guard', () => {
    expect(isPlainObject({})).toBe(true)
    expect(isPlainObject(null)).toBe(false)
    expect(isPlainObject(1)).toBe(false)
    expect(isPlainObject(new Date())).toBe(false)
    expect(isPlainObject(Object.getPrototypeOf({}))).toBe(false)
  })

  test('player joining', () => {
    const joinState = reducer(initialState, {type: 'JOIN', sender: 'foo'})
    expect(joinState).toStrictEqual({
      ...initialState,
      players: {foo: {ready: false}},
    })
  })

  test('player leaving', () => {
    const joinState = reducer(initialState, {type: 'JOIN', sender: 'foo'})
    const leaveState = reducer(joinState, {type: 'LEAVE', sender: 'foo'})
    expect(leaveState).toStrictEqual(initialState)
  })

  test('non-existent player leaving', () => {
    const newState = reducer(initialState, {type: 'LEAVE', sender: 'foo'})
    expect(newState).toStrictEqual({
      ...initialState,
      error: `Player, foo, does not exist in this game`,
    })
    expect(newState.players).toBe(initialState.players)
  })

  test('player joining with existing name', () => {
    const firstJoinState = reducer(initialState, {type: 'JOIN', sender: 'foo'})
    const secondJoinState = reducer(firstJoinState, {
      type: 'JOIN',
      sender: 'foo',
    })
    expect(secondJoinState).toStrictEqual({
      ...firstJoinState,
      error: `Player name, foo, is already taken`,
    })
    expect(secondJoinState.players).toBe(firstJoinState.players)
  })

  test('start game', () => {
    // For 6 players, apply a join and ready action
    const startState = R.range(0, 6).reduce(
      (state, i) =>
        [
          {type: 'JOIN', sender: `foo${i}`},
          {type: 'READY', sender: `foo${i}`},
        ].reduce(reducer, state),
      initialState,
    )
    expect(startState).toMatchObject({
      status: 'firstNight',
      players: R.fromPairs(R.range(0, 6).map(i => [`foo${i}`, {alive: true}])),
    })
  })

  test('invalid action', () => {
    const invalidType = reducer(initialState, {type: 1, sender: 'foo'})
    expect(invalidType).toStrictEqual({
      ...initialState,
      error: 'Invalid action',
    })
    expect(invalidType.players).toBe(initialState.players)
    const invalidSender = reducer(initialState, {type: 'JOIN', sender: 1})
    expect(invalidSender).toStrictEqual({
      ...initialState,
      error: 'Invalid action',
    })
    expect(invalidSender.players).toBe(initialState.players)
    const unknownType = reducer(initialState, {type: 'ASDF', sender: 'foo'})
    expect(unknownType).toStrictEqual({
      ...initialState,
      error: 'Unknown action type',
    })
    expect(unknownType.players).toBe(initialState.players)
  })

  test('middleware', () => {
    jest.useFakeTimers()
    const initialState: GameState = {
      status: 'waiting',
      players: R.zipObj(
        R.range(0, 6).map(i => `${i}`),
        [{ready: false}, ...new Array(5).fill({ready: true})],
      ),
      error: null,
    }
    let dispatcher: any = null
    const reporter: Middleware<GameState, any> = _store => next => {
      dispatcher = jest.fn(action => next(action))
      return dispatcher
    }
    const store = applyMiddleware(middleware, reporter)(createStore)(
      reducer,
      initialState,
    )
    store.dispatch({type: 'READY', sender: '0'})
    expect(store.getState().status).toBe('firstNight')
    expect(dispatcher).toHaveBeenCalledTimes(1)
    jest.runAllTimers()
    expect(dispatcher).toHaveBeenCalledTimes(2)
    expect(dispatcher).toHaveBeenNthCalledWith(2, {type: 'WAKE_MAFIA'})
  })

  test('inform', () => {
    const initialState: GameState = {
      status: 'firstNight',
      awake: 'mafia',
      players: R.zipObj(
        R.range(0, 6).map(i => `${i}`),
        [
          {alive: true, role: roleCreator.mafia()},
          {alive: true, role: roleCreator.mafia()},
          ...new Array(4).fill({alive: true, role: roleCreator.villager()}),
        ],
      ),
      error: null,
    }
    const store = applyMiddleware(middleware)(createStore)(
      reducer,
      initialState,
    )
    store.dispatch({type: 'ROLE_ACTION', roleAction: 'inform', sender: '0'})
    expect(store.getState().status).toBe('day')
  })
})
