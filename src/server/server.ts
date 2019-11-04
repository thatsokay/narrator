import http from 'http'
import Koa from 'koa'
import koaStatic from 'koa-static'
import send from 'koa-send'
import socketIO from 'socket.io'

import {newRegistry} from './registry'
import {EVENTS} from '../shared/constants'

const app = new Koa()
const io = socketIO()
const registry = newRegistry(io)

app.use(koaStatic(`${__dirname}/public`))
app.use(async (ctx: Koa.Context) => {
  await send(ctx, 'index.html', {root: `${__dirname}/public`})
})

io.on('connect', socket => {
  socket.on('disconnect', (reason: string) => {
    console.log(`Socket disconnected due to ${reason}`)
  })
  console.log('Socket connected')
  socket.on(EVENTS.CREATE_ROOM, (...args: unknown[]) => {
    if (
      args.length !== 2 ||
      typeof args[0] !== 'string' ||
      typeof args[1] !== 'function'
    ) {
      return
    }
    const [playerName, respond] = args
    // TODO: Remove room on joinRoom exception
    let roomId = registry.createRoom()
    try {
      registry.joinRoom(socket, playerName, roomId)
    } catch (error) {
      respond({success: false, reason: error})
      socket.disconnect()
      return
    }
    respond({success: true, roomId: roomId})
    socket.join(roomId)
    socket.on('disconnect', () => {
      registry.leave(socket.id)
    })
  })
  socket.on(EVENTS.JOIN_ROOM, (...args: unknown[]) => {
    if (
      args.length !== 3 ||
      typeof args[0] !== 'string' ||
      typeof args[1] !== 'string' ||
      typeof args[2] !== 'function'
    ) {
      return
    }
    const [playerName, roomId, respond] = args
    try {
      registry.joinRoom(socket, playerName, roomId)
    } catch (error) {
      respond({success: false, reason: error})
      socket.disconnect()
      return
    }
    respond({success: true})
    socket.join(roomId)
    socket.on('disconnect', () => {
      registry.leave(socket.id)
    })
  })
})

const server = http.createServer(app.callback())
io.attach(server)

export default server
