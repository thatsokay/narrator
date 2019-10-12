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
    /* Takes a player name and optionally a room id and returns an event
     * handler. Creates a socket that emits an event on connection depending on
     * whether a room id was provided.
     */
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
              console.log('Created room', response.roomId)
              setPlayerName(playerName)
              setRoomId(response.roomId)
            } else {
              console.log('Failed to create room due to', response.reason)
              socket.close()
              setSocket(null)
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
              console.log('Joined room', roomId)
              setPlayerName(playerName)
              setRoomId(roomId)
            } else {
              console.log(
                'Failed to join room',
                roomId,
                'because',
                response.reason,
              )
              socket.close()
              setSocket(null)
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
