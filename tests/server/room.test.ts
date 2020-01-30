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
  })

  test('leave', () => {
    room.join(mockServerSocket('foo'), 'foo')
    expect(() => room.leave('foo')).not.toThrow()
  })

  test('join with duplicate socket', () => {
    const socket = mockServerSocket('foo')
    room.join(socket, 'foo')
    expect(() => room.join(socket, 'bar')).toThrow(
      'Socket already in room',
    )
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
})
