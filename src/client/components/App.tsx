import React, {useState, useEffect} from 'react'
import socketIO from 'socket.io-client'

import CreateForm from './CreateForm'
import JoinForm from './JoinForm'

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

  useEffect(() => {
    setSocket(socketIO())
  }, [])

  const handleCreateSubmit = (playerName: string) => {
    setPlayerName(playerName)
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
