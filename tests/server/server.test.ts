import {Server} from 'http'
import {type Socket, io} from 'socket.io-client'
import R from 'ramda'

import {EVENTS} from '../../src/shared/constants'
import {EventResponse} from '../../src/shared/types'
import {GameState} from '../../src/shared/game/reducer'
import app from '../../src/server/server'

describe('server', () => {
  let server: Server
  let client: Socket

  beforeEach(() => {
    server = app.listen(3001)
    client = io('http://localhost:3001')
  })

  afterEach(() => {
    client.close()
    server.close()
  })

  test('creating room', (done) => {
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

  test('joining non-existent room', (done) => {
    client.once('connect', () => {
      client.emit(EVENTS.JOIN_ROOM, 'foo', 'foo', (response: EventResponse) => {
        expect(response).toStrictEqual({
          success: false,
          reason: 'Room with id FOO does not exist',
        })
        done()
      })
    })
  })

  test('creating multiple rooms', async () => {
    await expect(
      new Promise((resolve) => {
        client.once('connect', () => {
          client.emit(
            EVENTS.CREATE_ROOM,
            'foo',
            (response: EventResponse<{roomId: string}>) => {
              resolve(response.success)
            },
          )
        })
      }),
    ).resolves.toBe(true)

    await expect(
      new Promise((resolve) => {
        client.emit(
          EVENTS.CREATE_ROOM,
          'foo',
          (response: EventResponse<{roomId: string}>) => {
            resolve(response)
          },
        )
      }),
    ).resolves.toStrictEqual({success: false, reason: 'Already in a room'})
  })

  test('creating and joining room from single socket', async () => {
    const response = await new Promise<EventResponse<{roomId: string}>>(
      (resolve) => {
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
    expect(response.success).toBe(true)
    if (!response.success) {
      return
    }

    await expect(
      new Promise<EventResponse>((resolve) => {
        client.emit(
          EVENTS.JOIN_ROOM,
          'foo',
          response.roomId,
          (response: EventResponse) => {
            resolve(response)
          },
        )
      }),
    ).resolves.toStrictEqual({success: false, reason: 'Already in a room'})
  })

  test('start game', async () => {
    // Connect and create room
    const createResponse = await new Promise<EventResponse<{roomId: string}>>(
      (resolve) => {
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
      return
    }

    // 5 more connection join room
    const joinSockets = R.range(0, 5).map(() =>
      io('http://localhost:3001'),
    )
    await expect(
      Promise.all(
        joinSockets.map(
          (socket, i) =>
            new Promise<boolean>((resolve) => {
              socket.emit(
                EVENTS.JOIN_ROOM,
                `foo${i + 1}`,
                createResponse.roomId,
                (response: EventResponse) => {
                  resolve(response.success)
                },
              )
            }),
        ),
      ),
    ).resolves.toStrictEqual(new Array(5).fill(true))

    // Ready all players and start game
    await expect(
      Promise.all(
        [client, ...joinSockets].map(
          (socket) =>
            new Promise<void>((resolve) => {
              socket.emit(
                'gameAction',
                {type: 'READY'},
                (response: EventResponse) => {
                  expect(response.success).toBe(true)
                },
              )
              socket.on('gameState', (state: GameState) => {
                if (state.status === 'firstNight') {
                  resolve()
                }
              })
            }),
        ),
      ),
    ).resolves.toStrictEqual(new Array(6).fill(undefined))

    joinSockets.map((socket) => socket.close())
  })

  test('invalid create arguments', async () => {
    await new Promise<void>((resolve) => {
      client.once('connect', () => {
        resolve()
      })
    })
    await expect(
      new Promise((resolve, reject) => {
        client.emit(
          EVENTS.CREATE_ROOM,
          null,
          (response: EventResponse<{roomId: string}>) => {
            resolve(response)
          },
        )
        setTimeout(() => {
          reject('too slow')
        }, 500)
      }),
    ).rejects.toBe('too slow')
  })

  test('invalid join arguments', async () => {
    await new Promise<void>((resolve) => {
      client.once('connect', () => {
        resolve()
      })
    })
    await expect(
      new Promise((resolve, reject) => {
        client.emit(
          EVENTS.JOIN_ROOM,
          null,
          null,
          (response: EventResponse<{roomId: string}>) => {
            resolve(response)
          },
        )
        setTimeout(() => {
          reject('too slow')
        }, 500)
      }),
    ).rejects.toBe('too slow')
  })
})
