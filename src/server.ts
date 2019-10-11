import Koa from 'koa'
import koaStatic from 'koa-static'
import send from 'koa-send'
import socketIO from 'socket.io'

import {EVENTS} from './shared/constants'
import {EventResponse} from './shared/types'

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
      console.log(playerName, 'created a room')
      ack({success: true, roomId: 'ASDF'})
    },
  )
  socket.on(
    EVENTS.JOIN_ROOM,
    (
      playerName: string,
      roomId: string,
      ack: (response: EventResponse<{}>) => void,
    ) => {
      console.log(playerName, 'joined room', roomId)
      ack({success: true})
    },
  )
})

io.attach(app.listen(3000))

console.log('Server running on port 3000')
