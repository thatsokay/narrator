import R from 'ramda'

import {reducer} from '../../src/shared/game'

const initialState = Object.freeze(reducer(undefined, undefined))

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
  const secondJoinState = reducer(firstJoinState, {type: 'JOIN', sender: 'foo'})
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
