import Koa from 'koa'
import koaStatic from 'koa-static'
import send from 'koa-send'
import socketIO from 'socket.io'

import {EVENTS} from './constants'

const app = new Koa()
const io = socketIO()

app.use(koaStatic(`${__dirname}/public`))
app.use(async (ctx: Koa.Context) => {
  await send(ctx, 'index.html', {root: `${__dirname}/public`})
})

io.on('connection', (socket) => {
  console.log('Socket connected')
  socket.on('disconnect', (reason: string) => {
    console.log(`Socket disconnected due to ${reason}`)
  })
  socket.on(
    EVENTS.CREATE_ROOM,
    (playerName: string, ack: (roomId: string) => void) => {
      console.log(playerName, ' created a room')
      ack('ASDF')
    },
  )
})

io.attach(app.listen(3000))

console.log('Server running on port 3000')
