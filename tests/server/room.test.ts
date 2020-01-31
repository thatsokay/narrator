import R from 'ramda'

import {newRoom, Room} from '../../src/server/room'
import {mockServerSocket} from '../utilities'

describe('room', () => {
  let room: Room

  beforeEach(() => {
    room = newRoom('ASDF', {} as any)
  })

  test('empty', () => {
    expect(room.isEmpty()).toBe(true)
  })

  test('join', () => {
    expect(() => room.join(mockServerSocket('foo'), 'foo')).not.toThrow()
    expect(room.isEmpty()).toBe(false)
  })

  test('leave', () => {
    room.join(mockServerSocket('foo'), 'foo')
    expect(() => room.leave('foo')).not.toThrow()
  })

  test('join with duplicate socket', () => {
    const socket = mockServerSocket('foo')
    room.join(socket, 'foo')
    expect(() => room.join(socket, 'bar')).toThrow('Socket already in room')
  })

  test('join with duplicate name', () => {
    const playerName = 'foo'
    room.join(mockServerSocket('foo'), playerName)
    expect(() => room.join(mockServerSocket('bar'), playerName)).toThrow(
      'Player name is already taken',
    )
  })

  test('invalid leave', () => {
    expect(() => room.leave('foo')).toThrow('Socket not in room')
  })

  test('game start', () => {
    jest.useFakeTimers()
    const sockets: [string, any][] = R.range(0, 6).map(i => [
      `player ${i}`,
      mockServerSocket(`${i}`),
    ])
    sockets.forEach(([name, socket]) => room.join(socket, name))
    sockets.forEach(([_, socket]) =>
      expect(socket.emit).toHaveBeenLastCalledWith(
        'gameState',
        expect.objectContaining({status: 'waiting'}),
      ),
    )

    sockets.forEach(([_, socket]) =>
      socket.clientEmit('gameAction', {type: 'READY'}),
    )
    sockets.forEach(([_, socket]) =>
      expect(socket.emit).toHaveBeenLastCalledWith(
        'gameState',
        expect.objectContaining({status: 'firstNight', awake: null}),
      ),
    )

    jest.runAllTimers()
    sockets.forEach(([_, socket]) =>
      expect(socket.emit).toHaveBeenLastCalledWith(
        'gameState',
        expect.objectContaining({status: 'firstNight', awake: 'mafia'}),
      ),
    )
  })
})
