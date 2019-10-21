import {Server} from 'http'
import socketIOClient from 'socket.io-client'

import {EVENTS} from '../shared/constants'
import {EventResponse} from '../shared/types'

import app from './server'

let server: Server

beforeEach(() => {
  server = app.listen(3000)
})

afterEach(() => {
  server.close()
})

test('creating room', done => {
  const socket = socketIOClient('localhost:3000')
  socket.once('connect', () => {
    socket.emit(
      EVENTS.CREATE_ROOM,
      'foo',
      (response: EventResponse<{roomId: string}>) => {
        expect(response.success).toBe(true)
        socket.close()
        done()
      },
    )
  })
})

test('joining non-existent room', done => {
  const socket = socketIOClient('localhost:3000')
  socket.once('connect', () => {
    socket.emit(
      EVENTS.JOIN_ROOM,
      'foo',
      'foo',
      (response: EventResponse<{}>) => {
        expect(response.success).toBe(false)
        if (response.success === false) {
          expect(response.reason).toBe('Room with id FOO does not exist')
          socket.close()
          done()
        }
      },
    )
  })
})

test('creating multiple rooms', done => {
  const socket = socketIOClient('localhost:3000')
  socket.once('connect', () => {
    socket.emit(
      EVENTS.CREATE_ROOM,
      'foo',
      (response: EventResponse<{roomId: string}>) => {
        expect(response.success).toBe(true)
        if (response.success) {
          socket.emit(
            EVENTS.CREATE_ROOM,
            'foo',
            (response: EventResponse<{roomId: string}>) => {
              expect(response.success).toBe(false)
              if (response.success === false) {
                expect(response.reason).toBe('Already in a room')
                socket.close()
                done()
              }
            },
          )
        }
      },
    )
  })
})

test('creating and joining room', done => {
  const socket = socketIOClient('localhost:3000')
  socket.once('connect', () => {
    socket.emit(
      EVENTS.CREATE_ROOM,
      'foo',
      (response: EventResponse<{roomId: string}>) => {
        expect(response.success).toBe(true)
        if (response.success) {
          socket.emit(
            EVENTS.JOIN_ROOM,
            'foo',
            response.roomId,
            (response: EventResponse<{}>) => {
              expect(response.success).toBe(false)
              if (response.success === false) {
                expect(response.reason).toBe('Already in a room')
                socket.close()
                done()
              }
            },
          )
        }
      },
    )
  })
})
