import {Server} from 'http'
import socketIOClient from 'socket.io-client'

import app from './server'

let server: Server

beforeEach(() => {
  server = app.listen(3000)
})

afterEach(() => {
  server.close()
})

test('socket connection', done => {
  const socket = socketIOClient('localhost:3000')
  socket.once('connect', () => {
    socket.close()
    done()
  })
})
