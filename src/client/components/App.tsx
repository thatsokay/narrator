import React, {useState} from 'react'
import socketIO from 'socket.io-client'

import CreateForm from './CreateForm'
import JoinForm from './JoinForm'
import {EVENTS} from '../../shared/constants'
import {EventResponse} from '../../shared/types'

const App = () => {
  // TODO: Remove
  // @ts-ignore
  const [roomId, setRoomId] = useState('')
  // TODO: Remove
  // @ts-ignore
  const [playerName, setPlayerName] = useState('')
  // TODO: Remove
  // @ts-ignore
  const [socket, setSocket] = useState<SocketIOClient.Socket | null>(null)

  const handleSubmit = (playerName: string, roomId?: string) => (
    event: React.FormEvent,
  ) => {
    event.preventDefault()
    const socket = socketIO()
    socket.once('connect', () => {
      console.log('connected')
      if (roomId === undefined) {
        socket.emit(
          EVENTS.CREATE_ROOM,
          playerName,
          (response: EventResponse<{roomId: string}>) => {
            if (response.success) {
              console.log('room created', response.roomId)
              setPlayerName(playerName)
              setRoomId(response.roomId)
            }
          },
        )
      } else {
        socket.emit(
          EVENTS.JOIN_ROOM,
          playerName,
          roomId,
          (response: EventResponse<{}>) => {
            if (response.success) {
              console.log('joined room', roomId)
              setPlayerName(playerName)
              setRoomId(roomId)
            }
          },
        )
      }
    })
    socket.on('disconnect', () => {
      console.log('disconnected')
      setSocket(null)
    })
    setSocket(socket)
  }

  return (
    <>
      <CreateForm handleSubmit={handleSubmit} />
      <JoinForm handleSubmit={handleSubmit} />
    </>
  )
}

export default App
