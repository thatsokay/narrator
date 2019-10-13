import {createRoom, joinRoom, disconnect} from './registry'

test('creating and joining a room', () => {
  const roomId = createRoom('foo', 'foo', response => {
    expect(response.success).toBe(true)
    if (!response.success) {
      return ''
    }
    return response.roomId
  })

  joinRoom('bar', 'bar', roomId, response => {
    expect(response.success).toBe(true)
  })

  expect(disconnect('foo')).toBe(true)
  expect(disconnect('bar')).toBe(true)
})

test('joining non-existent room', () => {
  joinRoom('foo', 'foo', 'foo', response => {
    expect(response.success).toBe(false)
    if (response.success === true) {
      return
    }
    expect(response.reason).toBe('Room with id FOO does not exist')
  })
})