import React, {useState, useEffect} from 'react'
import {BehaviorSubject} from 'rxjs'

import {GameState, initialState} from '../../shared/game'

interface Props {
  playerName: string
  roomId: string
  gameState$: BehaviorSubject<GameState>
  socket: SocketIOClient.Socket
}

const Game = (props: Props) => {
  const [gameState, setGameState] = useState<GameState>(initialState)
  useEffect(() => {
    const subscription = props.gameState$.subscribe(state =>
      setGameState(state),
    )
    return () => subscription.unsubscribe()
  }, [props.gameState$])
  return (
    <>
      <h1>{props.roomId}</h1>
      <h2>{gameState.status}</h2>
      {(gameState.status === 'firstNight' || gameState.status === 'night') && (
        <p>Awake: {gameState.awake}</p>
      )}
      <button onClick={() => props.socket.emit('gameAction', {type: 'READY'})}>
        Ready
      </button>
      <ul>
        {Object.entries(gameState.players).map(([player, playerState]) => (
          <li key={player}>
            {playerState.ready && '☑️ '}
            {player}
          </li>
        ))}
      </ul>
    </>
  )
}

export default Game
