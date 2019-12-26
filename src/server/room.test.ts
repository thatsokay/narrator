import {newRoom, Room} from './room'

let room: Room

beforeEach(() => {
  room = newRoom('ASDF', {} as any)
})

test('empty', () => {
  expect(room.isEmpty()).toBe(true)
})

test('join', () => {
  expect(() => room.join({id: 'foo'} as any, 'foo')).not.toThrow()
})

test('leave', () => {
  room.join({id: 'foo'} as any, 'foo')
  expect(() => room.leave('foo')).not.toThrow()
})

test('join with duplicate socket', () => {
  room.join({id: 'foo'} as any, 'foo')
  expect(() => room.join({id: 'foo'} as any, 'bar')).toThrow(
    'Socket already in room',
  )
})

test('join with duplicate name', () => {
  room.join({id: 'foo'} as any, 'foo')
  expect(() => room.join({id: 'bar'} as any, 'foo')).toThrow(
    'Player name is already taken',
  )
})

test('invalid leave', () => {
  expect(() => room.leave('foo')).toThrow('Socket not in room')
})
