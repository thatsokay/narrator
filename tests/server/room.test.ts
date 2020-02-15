import R from 'ramda'

import {newRoom, Room} from '../../src/server/room'

describe('room', () => {
  let room: Room

  beforeEach(() => {
    room = newRoom('ASDF', {} as any)
  })

  test('empty', () => {
    expect(room.isEmpty()).toBe(true)
  })

  test('join', () => {
    expect(() => room.join('foo', 'foo')).not.toThrow()
    expect(room.isEmpty()).toBe(false)
  })

  test('leave', () => {
    room.join('foo', 'foo')
    expect(() => room.leave('foo')).not.toThrow()
  })

  test('join with duplicate socket', () => {
    const socket = 'foo'
    room.join(socket, 'foo')
    expect(() => room.join(socket, 'bar')).toThrow('Socket already in room')
  })

  test('join with duplicate name', () => {
    const playerName = 'foo'
    room.join('foo', playerName)
    expect(() => room.join('bar', playerName)).toThrow(
      'Player name is already taken',
    )
  })

  test('invalid leave', () => {
    expect(() => room.leave('foo')).toThrow('Socket not in room')
  })

  test('game start', () => {
    jest.useFakeTimers()
    const sockets = R.range(0, 6)
      .map(i => room.join(`${i}`, `${i}`))
      .map(([send$, receive]) => {
        const sender = jest.fn()
        send$.subscribe(sender)
        return [sender, receive] as const
      })
    sockets.forEach(([sender, _]) =>
      expect(sender).toHaveBeenLastCalledWith(
        expect.objectContaining({status: 'waiting'}),
      ),
    )

    sockets.forEach(([_, receive]) => receive({type: 'READY'}))
    sockets.forEach(([sender, _]) =>
      expect(sender).toHaveBeenLastCalledWith(
        expect.objectContaining({status: 'firstNight', awake: null}),
      ),
    )

    jest.runAllTimers()
    sockets.forEach(([sender, _]) =>
      expect(sender).toHaveBeenLastCalledWith(
        expect.objectContaining({status: 'firstNight', awake: 'mafia'}),
      ),
    )
  })
})
