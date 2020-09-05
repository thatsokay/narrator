import React, {useState, useEffect} from 'react'
import socketIO from 'socket.io-client'
import {BehaviorSubject, fromEvent} from 'rxjs'

import AppBar from './AppBar'
import CreateForm from './CreateForm'
import JoinForm from './JoinForm'
import Game from './Game'
import {EVENTS} from '../../shared/constants'
import {EventResponse} from '../../shared/types'
import {GameState, Action, initialState} from '../../shared/game'

const App = () => {
  const [playerName, setPlayerName] = useState('')
  const [roomId, setRoomId] = useState('')
  const [socket, setSocket] = useState<SocketIOClient.Socket | null>(null)
  const [inRoom, setInRoom] = useState(false)
  const [showForm, setShowForm] = useState<'create' | 'join'>('create')
  const [gameState$] = useState(new BehaviorSubject(initialState))

  useEffect(() => {
    if (!socket) {
      return () => {}
    }
    const subscription = fromEvent<GameState>(socket, 'gameState').subscribe(
      gameState$,
    )
    return () => subscription.unsubscribe()
  }, [socket, gameState$])

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

  const handleShowFormClickFactory = (form: typeof showForm) => (
    event: React.MouseEvent<HTMLAnchorElement>,
  ) => {
    event.preventDefault()
    setShowForm(form)
  }

  return (
    <>
      <AppBar className="pb-6" />
      <div className="w-full sm:w-64 px-8 sm:px-0 sm:mx-auto text-white">
        {inRoom && socket ? (
          <Game
            {...{
              playerName,
              roomId,
              gameState$,
              sendAction: (action: Action) => socket.emit('gameAction', action),
            }}
          />
        ) : (
          <>
            <div className="pb-6 flex justify-center">
              <a
                id="create-room-form"
                className={
                  'block px-4 py-2 border border-grey-200 rounded-l-sm text-sm uppercase no-underline ' +
                  (showForm === 'create'
                    ? 'text-black bg-grey-200'
                    : 'text-white')
                }
                onClick={handleShowFormClickFactory('create')}
                href="#"
              >
                New room
              </a>
              <a
                id="join-room-form"
                className={
                  'block -ml-px px-4 py-2 border border-grey-200 rounded-r-sm text-sm uppercase no-underline ' +
                  (showForm === 'join'
                    ? 'text-black bg-grey-200'
                    : 'text-white')
                }
                onClick={handleShowFormClickFactory('join')}
                href="#"
              >
                Join room
              </a>
            </div>
            {showForm === 'create' ? (
              <CreateForm handleSubmit={handleSubmit} />
            ) : (
              <JoinForm handleSubmit={handleSubmit} />
            )}
          </>
        )}
      </div>
    </>
  )
}

export default App
