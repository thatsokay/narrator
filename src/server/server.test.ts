import {Server} from 'http'
import socketIOClient from 'socket.io-client'

import {EVENTS} from '../shared/constants'
import {EventResponse} from '../shared/types'

import app from './server'

let server: Server
let client: SocketIOClient.Socket

beforeEach(() => {
  server = app.listen(3000)
  client = socketIOClient('localhost:3000')
})

afterEach(() => {
  client.close()
  server.close()
})

test('creating room', done => {
  client.once('connect', () => {
    client.emit(
      EVENTS.CREATE_ROOM,
      'foo',
      (response: EventResponse<{roomId: string}>) => {
        expect(response.success).toBe(true)
        done()
      },
    )
  })
})

test('joining non-existent room', done => {
  client.once('connect', () => {
    client.emit(
      EVENTS.JOIN_ROOM,
      'foo',
      'foo',
      (response: EventResponse<{}>) => {
        expect(response).toStrictEqual({
          success: false,
          reason: 'Room with id FOO does not exist',
        })
        done()
      },
    )
  })
})

test('creating multiple rooms', async done => {
  const response1 = await new Promise<EventResponse<{roomId: string}>>(
    resolve => {
      client.once('connect', () => {
        client.emit(
          EVENTS.CREATE_ROOM,
          'foo',
          (response: EventResponse<{roomId: string}>) => {
            resolve(response)
          },
        )
      })
    },
  )
  expect(response1.success).toBe(true)

  const response2 = await new Promise<EventResponse<{roomId: string}>>(
    resolve => {
      client.emit(
        EVENTS.CREATE_ROOM,
        'foo',
        (response: EventResponse<{roomId: string}>) => {
          resolve(response)
        },
      )
    },
  )
  expect(response2).toStrictEqual({success: false, reason: 'Already in a room'})
  done()
})

test('creating and joining room from single socket', async done => {
  const response1 = await new Promise<EventResponse<{roomId: string}>>(
    resolve => {
      client.once('connect', () => {
        client.emit(
          EVENTS.CREATE_ROOM,
          'foo',
          (response: EventResponse<{roomId: string}>) => {
            resolve(response)
          },
        )
      })
    },
  )
  expect(response1.success).toBe(true)
  if (!response1.success) {
    done()
    return
  }

  const response2 = await new Promise<EventResponse<{}>>(resolve => {
    client.emit(
      EVENTS.JOIN_ROOM,
      'foo',
      response1.roomId,
      (response: EventResponse<{}>) => {
        resolve(response)
      },
    )
  })
  expect(response2).toStrictEqual({success: false, reason: 'Already in a room'})
  done()
})

test('start game', async done => {
  const createResponse = await new Promise<EventResponse<{roomId: string}>>(
    resolve => {
      client.once('connect', () => {
        client.emit(
          EVENTS.CREATE_ROOM,
          'foo0',
          (response: EventResponse<{roomId: string}>) => {
            resolve(response)
          },
        )
      })
    },
  )
  expect(createResponse.success).toBe(true)
  if (!createResponse.success) {
    done()
    return
  }

  const joinSockets = new Array(5)
    .fill(null)
    .map(() => socketIOClient('localhost:3000'))
  await expect(
    Promise.all(
      joinSockets.map(
        (socket, i) =>
          new Promise<boolean>(resolve => {
            socket.emit(
              EVENTS.JOIN_ROOM,
              `foo${i + 1}`,
              createResponse.roomId,
              (response: EventResponse<{}>) => {
                resolve(response.success)
              },
            )
          }),
      ),
    ),
  ).resolves.toStrictEqual(new Array(5).fill(true))

  await expect(
    Promise.all(
      [client, ...joinSockets].map(
        socket =>
          new Promise<void>(resolve => {
            socket.emit(
              'gameEvent',
              {type: 'ready'},
              (response: EventResponse<{}>) => {
                expect(response.success).toBe(true)
              },
            )
            socket.on('start', () => {
              resolve()
            })
          }),
      ),
    ),
  ).resolves.toStrictEqual(new Array(6).fill(undefined))

  joinSockets.map(socket => socket.close())
  done()
})
