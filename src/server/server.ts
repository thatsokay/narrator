import Koa from 'koa'
import koaStatic from 'koa-static'
import send from 'koa-send'
import socketIO from 'socket.io'

import {newRegistry, createRoom, joinRoom, leave} from './registry'
import {EVENTS} from '../shared/constants'
import {EventResponse} from '../shared/types'

const app = new Koa()
const io = socketIO()
const registry = newRegistry()

app.use(koaStatic(`${__dirname}/public`))
app.use(async (ctx: Koa.Context) => {
  await send(ctx, 'index.html', {root: `${__dirname}/public`})
})

io.on('connection', socket => {
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
      createRoom(registry, socket.id, playerName, ack)
      socket.on('disconnect', () => {
        leave(registry, socket.id)
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
      joinRoom(registry, socket.id, playerName, roomId, ack)
      socket.on('disconnect', () => {
        leave(registry, socket.id)
      })
    },
  )
})

io.attach(app.listen(3000))

console.log('Server running on port 3000')
