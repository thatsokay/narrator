import React, {useState, useEffect} from 'react'
import socketIO from 'socket.io-client'
import {BehaviorSubject, fromEvent} from 'rxjs'
import 'tachyons/css/tachyons.min.css'

import CreateForm from './CreateForm'
import JoinForm from './JoinForm'
import Game from './Game'
import {EVENTS} from '../../shared/constants'
import {EventResponse} from '../../shared/types'
import {GameState, initialState} from '../../shared/game'

const App = () => {
  const [playerName, setPlayerName] = useState('')
  const [roomId, setRoomId] = useState('')
  const [socket, setSocket] = useState<SocketIOClient.Socket | null>(null)
  const [inRoom, setInRoom] = useState(false)
  const [showForm, setShowForm] = useState<'create' | 'join'>('create')
  const [gameState$] = useState(new BehaviorSubject<GameState>(initialState))

  useEffect(() => {
    if (!socket) {
      return () => {}
    }
    const subscription = fromEvent<GameState>(socket, 'gameState').subscribe(
      gameState$,
    )
    return () => subscription.unsubscribe()
  }, [socket])

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
          (response: EventResponse) => {
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
    <div
      className="sans-serif mw6"
      style={{marginLeft: 'auto', marginRight: 'auto'}}
    >
      {inRoom && socket ? (
        <Game
          {...{
            playerName,
            roomId,
            gameState$,
            sendAction: (action: any) => socket.emit('gameAction', action),
          }}
        />
      ) : (
        <>
          <div className="flex justify-center">
            <div className="ba" style={{marginRight: '-1px'}}>
              <a
                className="no-underline black hover-bg-black hover-white db items-center pa3"
                onClick={() => setShowForm('create')}
              >
                New room
              </a>
            </div>
            <div className="ba">
              <a
                className="no-underline black hover-bg-black hover-white db items-center pa3"
                onClick={() => setShowForm('join')}
              >
                Join room
              </a>
            </div>
          </div>
          {showForm === 'create' ? (
            <CreateForm handleSubmit={handleSubmit} />
          ) : (
            <JoinForm handleSubmit={handleSubmit} />
          )}
        </>
      )}
    </div>
  )
}

export default App
