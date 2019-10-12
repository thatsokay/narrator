import Koa from 'koa'
import koaStatic from 'koa-static'
import send from 'koa-send'
import socketIO from 'socket.io'

import {createRoom, joinRoom} from './registry'
import {EVENTS} from '../shared/constants'
import {EventResponse} from '../shared/types'

const app = new Koa()
const io = socketIO()

app.use(koaStatic(`${__dirname}/public`))
app.use(async (ctx: Koa.Context) => {
  await send(ctx, 'index.html', {root: `${__dirname}/public`})
})

io.on('connection', socket => {
  console.log('Socket connected')
  socket.on('disconnect', (reason: string) => {
    console.log(`Socket disconnected due to ${reason}`)
  })
  socket.on(
    EVENTS.CREATE_ROOM,
    (
      playerName: string,
      ack: (response: EventResponse<{roomId: string}>) => void,
    ) => {
      createRoom(playerName, ack)
    },
  )
  socket.on(
    EVENTS.JOIN_ROOM,
    (
      playerName: string,
      roomId: string,
      ack: (response: EventResponse<{}>) => void,
    ) => {
      joinRoom(playerName, roomId, ack)
    },
  )
})

io.attach(app.listen(3000))

console.log('Server running on port 3000')
