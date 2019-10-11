import React, {useState} from 'react'
import socketIO from 'socket.io-client'

import CreateForm from './CreateForm'
import JoinForm from './JoinForm'
import {EVENTS} from '../../constants'

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

  const handleCreateSubmit = (playerName: string) => {
    const socket = socketIO()
    socket.once('connect', () => {
      console.log('connected')
      socket.emit(EVENTS.CREATE_ROOM, playerName, (roomId: string) => {
        console.log(`room created ${roomId}`)
        setRoomId(roomId)
      })
    })
    setPlayerName(playerName)
    setSocket(socket)
  }

  const handleJoinSubmit = (roomId: string, playerName: string) => {
    setRoomId(roomId)
    setPlayerName(playerName)
  }

  return (
    <>
      <CreateForm handleSubmit={handleCreateSubmit} />
      <JoinForm handleSubmit={handleJoinSubmit} />
    </>
  )
}

export default App
