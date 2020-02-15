import R from 'ramda'

import {
  GameState,
  reducer,
  isPlainObject,
  middleware,
} from '../../src/shared/game'
import {ROLES} from '../../src/shared/roles'
import {createStore, applyMiddleware, Middleware} from '../../src/server/store'

const initialState = Object.freeze(reducer())

describe('game', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

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

  // Status change is done by middleware
  test.skip('start game', () => {
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
    expect(dispatcher).toHaveBeenCalledTimes(2)
    expect(dispatcher).toHaveBeenNthCalledWith(2, {type: 'START_GAME'})
    jest.runAllTimers()
    expect(dispatcher).toHaveBeenCalledTimes(3)
    expect(dispatcher).toHaveBeenNthCalledWith(3, {type: 'WAKE_MAFIA'})
  })

  test('first night', () => {
    const initialState: GameState = {
      status: 'firstNight',
      awake: 'mafia',
      players: R.zipObj(
        R.range(0, 6).map(i => `${i}`),
        [
          ...new Array(2).fill({alive: true, role: ROLES.mafia}),
          ...new Array(3).fill({alive: true, role: ROLES.villager}),
          {alive: true, role: ROLES.detective},
        ],
      ),
      error: null,
    }
    const store = applyMiddleware(middleware)(createStore)(
      reducer,
      initialState,
    )
    store.dispatch({type: 'ROLE_ACTION', roleAction: 'inform', sender: '0'})
    expect(store.getState()).toMatchObject({
      status: 'firstNight',
      awake: 'mafia',
      players: {
        '0': {role: {actions: {firstNight: {completed: true}}}},
        '1': {role: {actions: {firstNight: {completed: false}}}},
      },
    })
    store.dispatch({type: 'ROLE_ACTION', roleAction: 'inform', sender: '1'})
    expect(store.getState()).toMatchObject({
      status: 'firstNight',
      awake: null,
      players: {
        '0': {role: {actions: {firstNight: {completed: true}}}},
        '1': {role: {actions: {firstNight: {completed: true}}}},
      },
    })
    jest.runAllTimers()
    expect(store.getState()).toMatchObject({
      status: 'day',
      players: {
        '0': {role: {actions: {firstNight: {completed: false}}}},
        '1': {role: {actions: {firstNight: {completed: false}}}},
      },
    })
  })

  test('day lynch', () => {
    const initialState: GameState = {
      status: 'day',
      players: R.zipObj(
        R.range(0, 6).map(i => `${i}`),
        [
          {alive: true, role: ROLES.mafia},
          {alive: true, role: ROLES.detective},
          {alive: true, role: ROLES.nurse},
          ...new Array(3).fill({alive: true, role: ROLES.villager}),
        ],
      ),
      error: null,
    }
    const store = applyMiddleware(middleware)(createStore)(
      reducer,
      initialState,
    )
    store.dispatch({type: 'ROLE_ACTION', lynch: '1', sender: '0'})
    expect(store.getState()).toMatchObject({
      status: 'day',
      players: {
        '0': {
          role: {actions: {day: {completed: true, name: 'lynch', lynch: '1'}}},
        },
        '1': {
          role: {
            actions: {day: {completed: false, name: 'lynch', lynch: null}},
          },
        },
        '2': {
          role: {
            actions: {day: {completed: false, name: 'lynch', lynch: null}},
          },
        },
      },
    })
    // Test null vote
    store.dispatch({type: 'ROLE_ACTION', lynch: null, sender: '1'})
    expect(store.getState()).toMatchObject({
      status: 'day',
      players: {
        '0': {
          role: {actions: {day: {completed: true, name: 'lynch', lynch: '1'}}},
        },
        '1': {
          role: {actions: {day: {completed: true, name: 'lynch', lynch: null}}},
        },
        '2': {
          role: {
            actions: {day: {completed: false, name: 'lynch', lynch: null}},
          },
        },
      },
    })
    // Test invalid lynch target vote
    store.dispatch({type: 'ROLE_ACTION', lynch: 'x', sender: '2'})
    expect(store.getState()).toMatchObject({
      status: 'day',
      players: {
        '0': {
          role: {actions: {day: {completed: true, name: 'lynch', lynch: '1'}}},
        },
        '1': {
          role: {actions: {day: {completed: true, name: 'lynch', lynch: null}}},
        },
        '2': {
          role: {
            actions: {day: {completed: false, name: 'lynch', lynch: null}},
          },
        },
      },
    })
    R.range(2, 6).forEach(i =>
      store.dispatch({type: 'ROLE_ACTION', lynch: '5', sender: `${i}`}),
    )
    expect(store.getState()).toMatchObject({
      status: 'night',
      awake: null,
      players: {
        '0': {
          role: {actions: {day: {completed: false, name: 'lynch', lynch: '1'}}},
        },
        '1': {
          role: {
            actions: {day: {completed: false, name: 'lynch', lynch: null}},
          },
        },
        '5': {alive: false},
      },
    })
    jest.runAllTimers()
    expect(store.getState()).toMatchObject({status: 'night', awake: 'mafia'})
  })
})
