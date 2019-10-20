import {Registry, newRegistry} from './registry'

let registry: Registry

beforeEach(() => {
  registry = newRegistry()
})

test('creating, joining, and leaving a room', () => {
  let roomId: string = ''
  registry.createRoom('foo', 'foo', response => {
    expect(response.success).toBe(true)
    if (response.success) {
      roomId = response.roomId
    }
  })
  expect(roomId).toBeTruthy()

  registry.joinRoom('bar', 'bar', roomId, response => {
    expect(response.success).toBe(true)
  })

  expect(registry.leave('foo')).toBe(true)
  expect(registry.leave('bar')).toBe(true)
})

test('joining non-existent room', () => {
  registry.joinRoom('foo', 'foo', 'foo', response => {
    expect(response.success).toBe(false)
    if (response.success === false) {
      expect(response.reason).toBe('Room with id FOO does not exist')
    }
  })
})

test('joining room with existing socket id', () => {
  registry.createRoom('foo', 'foo', response => {
    expect(response.success).toBe(true)
    if (response.success) {
      registry.joinRoom('foo', 'foo', response.roomId, response => {
        expect(response.success).toBe(false)
        if (response.success === false) {
          expect(response.reason).toBe('Already in a room')
        }
      })
    }
  })
})

test('joining room with existing player name', () => {
  registry.createRoom('foo', 'foo', response => {
    expect(response.success).toBe(true)
    if (response.success) {
      registry.joinRoom('bar', 'foo', response.roomId, response => {
        expect(response.success).toBe(false)
        if (response.success === false) {
          expect(response.reason).toBe('Player name foo is already taken')
        }
      })
    }
  })
})

test('non-existent socket leaving', () => {
  expect(registry.leave('foo')).toBe(false)
})
