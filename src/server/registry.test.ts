import {Registry, newRegistry, createRoom, joinRoom, leave} from './registry'

let registry: Registry

beforeEach(() => {
  registry = newRegistry()
})

test('creating, joining, and leaving a room', () => {
  let roomId: string = ''
  createRoom(registry, 'foo', 'foo', response => {
    expect(response.success).toBe(true)
    if (response.success) {
      roomId = response.roomId
    }
  })
  expect(roomId).toBeTruthy()

  joinRoom(registry, 'bar', 'bar', roomId, response => {
    expect(response.success).toBe(true)
  })

  expect(leave(registry, 'foo')).toBe(true)
  expect(leave(registry, 'bar')).toBe(true)
  expect(registry).toStrictEqual(newRegistry())
})

test('joining non-existent room', () => {
  joinRoom(registry, 'foo', 'foo', 'foo', response => {
    expect(response.success).toBe(false)
    if (response.success === true) {
      return
    }
    expect(response.reason).toBe('Room with id FOO does not exist')
  })
})
