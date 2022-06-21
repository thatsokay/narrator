import R from 'ramda'

import {GameState, reducer, middleware} from '../../src/shared/game/reducer'
import {ROLES} from '../../src/shared/roles'
import {createStore, applyMiddleware, Middleware} from '../../src/server/store'
import {RootAction} from '../../src/shared/game/actions'

const initialState = Object.freeze(reducer())

describe('game', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  test('player joining', () => {
    const joinState = reducer(initialState, {type: 'room/join', sender: 'foo'})
    expect(joinState).toStrictEqual({
      ...initialState,
      players: {foo: {ready: false}},
    })
  })

  test('player leaving', () => {
    const joinState = reducer(initialState, {type: 'room/join', sender: 'foo'})
    const leaveState = reducer(joinState, {type: 'room/leave', sender: 'foo'})
    expect(leaveState).toStrictEqual(initialState)
  })

  test('non-existent player leaving', () => {
    const newState = reducer(initialState, {type: 'room/leave', sender: 'foo'})
    expect(newState).toStrictEqual({
      ...initialState,
      error: `Player, foo, does not exist in this game`,
    })
    expect(newState.players).toBe(initialState.players)
  })

  test('player joining with existing name', () => {
    const firstJoinState = reducer(initialState, {
      type: 'room/join',
      sender: 'foo',
    })
    const secondJoinState = reducer(firstJoinState, {
      type: 'room/join',
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
          {type: 'room/join' as const, sender: `foo${i}`},
          {type: 'waiting/ready' as const, sender: `foo${i}`},
        ].reduce(reducer, state),
      initialState,
    )
    expect(startState).toMatchObject({
      status: 'firstNight',
      players: R.fromPairs(
        R.range(0, 6).map((i) => [`foo${i}`, {alive: true}]),
      ),
    })
  })

  test('invalid action', () => {
    const unknownType = reducer(initialState, {
      type: 'asdf' as any,
      sender: 'foo',
    })
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
        R.range(0, 6).map((i) => `${i}`),
        [{ready: false}, ...new Array(5).fill({ready: true})],
      ),
      error: null,
    }
    let dispatcher: any
    const reporter: Middleware<GameState, RootAction> = (_store) => (next) => {
      dispatcher = jest.fn((action) => next(action))
      return dispatcher
    }
    const store = applyMiddleware(middleware, reporter)(createStore)(
      reducer,
      initialState,
    )
    store.dispatch({type: 'waiting/ready', sender: '0'})
    expect(store.getState().status).toBe('night')
    expect(dispatcher).toHaveBeenCalledTimes(2)
    expect(dispatcher).toHaveBeenNthCalledWith(2, {type: 'game/start'})
    jest.runAllTimers()
    expect(dispatcher).toHaveBeenCalledTimes(3)
    expect(dispatcher).toHaveBeenNthCalledWith(3, {type: 'game/wake/mafia'})
  })

  test.skip('first night', () => {
    const initialState: GameState = {
      status: 'night',
      awake: 'mafia',
      players: R.zipObj(
        R.range(0, 6).map((i) => `${i}`),
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
    store.dispatch({type: 'night/inform', sender: '0'})
    expect(store.getState()).toMatchObject({
      status: 'firstNight',
      awake: 'mafia',
      players: {
        '0': {role: {actionStates: {firstNight: {completed: true}}}},
        '1': {role: {actionStates: {firstNight: {completed: false}}}},
      },
    })
    store.dispatch({type: 'night/inform', sender: '1'})
    expect(store.getState()).toMatchObject({
      status: 'firstNight',
      awake: null,
      players: {
        '0': {role: {actionStates: {firstNight: {completed: true}}}},
        '1': {role: {actionStates: {firstNight: {completed: true}}}},
      },
    })
    jest.runAllTimers()
    expect(store.getState()).toMatchObject({
      status: 'day',
      players: {
        '0': {role: {actionStates: {firstNight: {completed: false}}}},
        '1': {role: {actionStates: {firstNight: {completed: false}}}},
      },
    })
  })

  test('day lynch', () => {
    const initialState: GameState = {
      status: 'day',
      players: R.zipObj(
        R.range(0, 6).map((i) => `${i}`),
        [
          {alive: true, role: {name: 'mafia', actionStates: {}}},
          {alive: true, role: {name: 'detective', actionStates: {}}},
          {alive: true, role: {name: 'nurse', actionStates: {}}},
          ...new Array(3).fill({
            alive: true,
            role: {name: 'villager', actionStates: {}},
          }),
        ],
      ),
      error: null,
    }
    const store = applyMiddleware(middleware)(createStore)(
      reducer,
      initialState,
    )
    store.dispatch({type: 'day/lynch', lynch: '1', sender: '0'})
    expect(store.getState()).toMatchObject({
      status: 'day',
      players: {
        '0': {role: {actionStates: {day: {lynch: '1'}}}},
      },
    })
    // Test null vote
    store.dispatch({type: 'day/lynch', lynch: null, sender: '1'})
    expect(store.getState()).toMatchObject({
      status: 'day',
      players: {
        '0': {role: {actionStates: {day: {lynch: '1'}}}},
        '1': {role: {actionStates: {day: {lynch: null}}}},
      },
    })
    // Test invalid lynch target vote
    store.dispatch({type: 'day/lynch', lynch: 'x', sender: '2'})
    expect(store.getState()).toMatchObject({
      status: 'day',
      players: {
        '0': {role: {actionStates: {day: {lynch: '1'}}}},
        '1': {role: {actionStates: {day: {lynch: null}}}},
        '2': {
          role: {
            actionStates: expect.not.objectContaining({day: expect.anything()}),
          },
        },
      },
    })
    R.range(2, 6).forEach((i) =>
      store.dispatch({type: 'day/lynch', lynch: '5', sender: `${i}`}),
    )
    expect(store.getState()).toMatchObject({
      status: 'night',
      awake: null,
      players: {
        '0': {role: {actionStates: {}}},
        '1': {role: {actionStates: {}}},
        '5': {alive: false},
      },
    })
    jest.runAllTimers()
    expect(store.getState()).toMatchObject({status: 'night', awake: 'mafia'})
  })
})
