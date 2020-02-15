import http from 'http'
import Koa from 'koa'
import koaStatic from 'koa-static'
import send from 'koa-send'
import socketIO from 'socket.io'
import {Observable} from 'rxjs'

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
  socket.on(EVENTS.CREATE_ROOM, (playerName: unknown, respond: unknown) => {
    if (typeof playerName !== 'string' || typeof respond !== 'function') {
      return
    }
    // TODO: Remove room on joinRoom exception
    const roomId = registry.createRoom()
    let send$: Observable<any>
    let receive: (action: unknown) => void
    try {
      ;[send$, receive] = registry.joinRoom(socket.id, playerName, roomId)
    } catch (error) {
      respond({success: false, reason: error})
      socket.disconnect()
      return
    }
    respond({success: true, roomId: roomId})
    send$.subscribe(state => socket.emit('gameState', state))
    socket.on('gameAction', receive)
    socket.on('disconnect', () => {
      registry.leave(socket.id)
    })
  })
  socket.on(
    EVENTS.JOIN_ROOM,
    (playerName: unknown, roomId: unknown, respond: unknown) => {
      if (
        typeof playerName !== 'string' ||
        typeof roomId !== 'string' ||
        typeof respond !== 'function'
      ) {
        return
      }
      let send$: Observable<any>
      let receive: (action: unknown) => void
      try {
        ;[send$, receive] = registry.joinRoom(socket.id, playerName, roomId)
      } catch (error) {
        respond({success: false, reason: error})
        socket.disconnect()
        return
      }
      respond({success: true})
      send$.subscribe(state => socket.emit('gameState', state))
      socket.on('gameAction', receive)
      socket.on('disconnect', () => {
        registry.leave(socket.id)
      })
    },
  )
})

const server = http.createServer(app.callback())
io.attach(server)

export default server
