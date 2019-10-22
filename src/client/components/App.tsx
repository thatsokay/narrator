import React, {useState} from 'react'
import socketIO from 'socket.io-client'

import CreateForm from './CreateForm'
import JoinForm from './JoinForm'
import Game from './Game'
import {EVENTS} from '../../shared/constants'
import {EventResponse} from '../../shared/types'

const App = () => {
  // TODO: Remove
  // @ts-ignore
  const [playerName, setPlayerName] = useState('')
  // TODO: Remove
  // @ts-ignore
  const [roomId, setRoomId] = useState('')
  // TODO: Remove
  // @ts-ignore
  const [socket, setSocket] = useState<SocketIOClient.Socket | null>(null)
  // TODO: Remove
  // @ts-ignore
  const [inRoom, setInRoom] = useState(false)

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
              setInRoom(true)
            } else {
              console.log('Failed to create room due to', response.reason)
              socket.close()
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
              setInRoom(true)
            } else {
              console.log(
                'Failed to join room',
                roomId,
                'because',
                response.reason,
              )
              socket.close()
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
      {inRoom && socket ? (
        <Game {...{playerName, roomId, socket}} />
      ) : (
        <>
          <CreateForm handleSubmit={handleSubmit} />
          <JoinForm handleSubmit={handleSubmit} />
        </>
      )}
    </>
  )
}

export default App
