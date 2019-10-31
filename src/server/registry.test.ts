import {Registry, newRegistry} from './registry'

let registry: Registry

beforeEach(() => {
  registry = newRegistry()
})

test('creating, joining, and leaving a room', () => {
  let roomId = registry.createRoom()
  registry.joinRoom('foo', 'foo', roomId)
  registry.joinRoom('bar', 'bar', roomId)
  expect(registry.leave('foo')).toBe(true)
  expect(registry.leave('bar')).toBe(true)
})

test('joining non-existent room', () => {
  expect(() => {
    registry.joinRoom('foo', 'foo', 'foo')
  }).toThrow('Room with id FOO does not exist')
})

test('joining room with existing socket id', () => {
  const roomId = registry.createRoom()
  registry.joinRoom('foo', 'foo', roomId)
  expect(() => {
    registry.joinRoom('foo', 'foo', roomId)
  }).toThrow('Already in a room')
})

test('joining room with existing player name', () => {
  const roomId = registry.createRoom()
  registry.joinRoom('foo', 'foo', roomId)
  expect(() => {
    registry.joinRoom('bar', 'foo', roomId)
  }).toThrow('Player name foo is already taken')
})

test('non-existent socket leaving', () => {
  expect(registry.leave('foo')).toBe(false)
})
