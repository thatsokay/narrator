import {Registry, newRegistry} from '../../src/server/registry'
import {mockServerSocket} from '../utilities'

let registry: Registry
let io: SocketIO.Server

beforeEach(() => {
  io = {} as SocketIO.Server
  registry = newRegistry(io)
})

test('creating, joining, and leaving a room', () => {
  const roomId = registry.createRoom()
  const socket1 = mockServerSocket('foo')
  const socket2 = mockServerSocket('bar')
  registry.joinRoom(socket1, 'foo', roomId)
  registry.joinRoom(socket2, 'bar', roomId)
  expect(registry.leave(socket1.id)).toBe(true)
  expect(registry.leave(socket2.id)).toBe(true)
  expect(socket1.on).toBeCalled()
  expect(socket2.on).toBeCalled()
})

test('joining non-existent room', () => {
  expect(() => {
    registry.joinRoom(mockServerSocket('foo'), 'foo', 'foo')
  }).toThrow('Room with id FOO does not exist')
})

test('joining room with existing socket id', () => {
  const roomId = registry.createRoom()
  registry.joinRoom(mockServerSocket('foo'), 'foo', roomId)
  expect(() => {
    registry.joinRoom(mockServerSocket('foo'), 'foo', roomId)
  }).toThrow('Already in a room')
})

test('joining room with existing player name', () => {
  const roomId = registry.createRoom()
  registry.joinRoom(mockServerSocket('foo'), 'foo', roomId)
  expect(() => {
    registry.joinRoom(mockServerSocket('bar'), 'foo', roomId)
  }).toThrow('Player name is already taken')
})

test('non-existent socket leaving', () => {
  expect(registry.leave('foo')).toBe(false)
})
