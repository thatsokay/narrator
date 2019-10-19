import http from 'http'
import Koa from 'koa'
import koaStatic from 'koa-static'
import send from 'koa-send'
import socketIO from 'socket.io'

import {newRegistry} from './registry'
import {EVENTS} from '../shared/constants'
import {EventResponse} from '../shared/types'

const app = new Koa()
const io = socketIO()
const registry = newRegistry()

app.use(koaStatic(`${__dirname}/public`))
app.use(async (ctx: Koa.Context) => {
  await send(ctx, 'index.html', {root: `${__dirname}/public`})
})

io.on('connect', socket => {
  socket.on('disconnect', (reason: string) => {
    console.log(`Socket disconnected due to ${reason}`)
  })
  console.log('Socket connected')
  socket.once(
    EVENTS.CREATE_ROOM,
    (
      playerName: string,
      ack: (response: EventResponse<{roomId: string}>) => void,
    ) => {
      registry.createRoom(socket.id, playerName, ack)
      socket.on('disconnect', () => {
        registry.leave(socket.id)
      })
    },
  )
  socket.once(
    EVENTS.JOIN_ROOM,
    (
      playerName: string,
      roomId: string,
      ack: (response: EventResponse<{}>) => void,
    ) => {
      registry.joinRoom(socket.id, playerName, roomId, ack)
      socket.on('disconnect', () => {
        registry.leave(socket.id)
      })
    },
  )
})

const server = http.createServer(app.callback())
io.attach(server)

export default server
