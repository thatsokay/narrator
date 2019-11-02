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
  socket.on(
    EVENTS.CREATE_ROOM,
    (
      playerName: string,
      ack: (response: EventResponse<{roomId: string}>) => void,
    ) => {
      let roomId = registry.createRoom()
      let handleEvent
      try {
        handleEvent = registry.joinRoom(socket.id, playerName, roomId)
      } catch (error) {
        ack({success: false, reason: error})
        socket.disconnect()
        return
      }
      ack({success: true, roomId: roomId})
      socket.join(roomId)
      socket.on('gameEvent', handleEvent(io))
      socket.on('disconnect', () => {
        registry.leave(socket.id)
      })
    },
  )
  socket.on(
    EVENTS.JOIN_ROOM,
    (
      playerName: string,
      roomId: string,
      ack: (response: EventResponse<{}>) => void,
    ) => {
      let handleEvent
      try {
        handleEvent = registry.joinRoom(socket.id, playerName, roomId)
      } catch (error) {
        ack({success: false, reason: error})
        socket.disconnect()
        return
      }
      ack({success: true})
      socket.join(roomId)
      socket.on('gameEvent', handleEvent(io))
      socket.on('disconnect', () => {
        registry.leave(socket.id)
      })
    },
  )
})

const server = http.createServer(app.callback())
io.attach(server)

export default server
