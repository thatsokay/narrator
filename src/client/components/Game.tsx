import React, {useState, useEffect} from 'react'
import {Observable} from 'rxjs'

import {GameState, initialState} from '../../shared/game'

interface Props {
  playerName: string
  roomId: string
  gameState$: Observable<GameState>
  sendAction: (action: any) => void
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
      {gameState.status === 'firstNight' &&
        gameState.players[props.playerName].role.name === 'mafia' &&
        gameState.awake === 'mafia' && (
          <button onClick={() => props.sendAction({type: 'ROLE_ACTION'})}>
            Inform
          </button>
        )}
      {gameState.status === 'waiting' && (
        <button onClick={() => props.sendAction({type: 'READY'})}>Ready</button>
      )}
      <ul>
        {Object.entries(gameState.players).map(([player, playerState]) => (
          <li key={player}>
            {playerState.ready && '☑️ '}
            {player}
            {gameState.status === 'day' &&
              gameState.players[props.playerName].role.actions.day && (
                <button
                  onClick={() =>
                    props.sendAction({type: 'ROLE_ACTION', lynch: player})
                  }
                >
                  Lynch
                </button>
              )}
          </li>
        ))}
      </ul>
    </>
  )
}

export default Game
