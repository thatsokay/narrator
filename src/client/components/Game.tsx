import React, {useState, useEffect} from 'react'
import {Observable} from 'rxjs'

import {GameState, Action, initialState} from '../../shared/game'

interface Props {
  playerName: string
  roomId: string
  gameState$: Observable<GameState>
  sendAction: (action: Action) => void
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
      <div className="flex justify-between">
        <h2 className="ttc">
          {gameState.status === 'firstNight' ? 'night' : gameState.status}
        </h2>
        <h2 id="room-id">{props.roomId}</h2>
      </div>
      {gameState.status !== 'waiting' && (
        <div>
          <span className="bg-moon-gray moon-gray">
            {gameState.players[props.playerName].role.name}
          </span>
        </div>
      )}
      {(gameState.status === 'firstNight' || gameState.status === 'night') && (
        <p>
          Awake: <span className="ttc">{gameState.awake ?? 'nobody'}</span>
        </p>
      )}
      <InformActionable {...{...props, gameState}} />
      <ReadyActionable {...{...props, gameState}} />
      <ul className="list">
        {Object.entries<GameState['players'][string]>(gameState.players).map(
          ([player, playerState]) => (
            <li key={player}>
              {playerState.status !== 'waiting' &&
                (playerState.alive ? '🙂 ' : '💀 ')}
              {player}
              {playerState.status === 'waiting' &&
                playerState.ready &&
                ': Ready'}
              {gameState.status === 'day' &&
                gameState.players[props.playerName].role.actions.day?.name ===
                  'lynch' && (
                  <button
                    onClick={() =>
                      props.sendAction({type: 'ROLE_ACTION', lynch: player})
                    }
                  >
                    Lynch
                  </button>
                )}
            </li>
          ),
        )}
      </ul>
    </>
  )
}

interface ActionableProps extends Omit<Props, 'gameState$'> {
  gameState: GameState
}

const ReadyActionable = ({gameState, sendAction}: ActionableProps) =>
  gameState.status === 'waiting' ? (
    <button onClick={() => sendAction({type: 'READY'})}>Ready</button>
  ) : (
    <></>
  )

const InformActionable = ({
  gameState,
  playerName,
  sendAction,
}: ActionableProps) =>
  gameState.status === 'firstNight' &&
  gameState.players[playerName].role.name === gameState.awake &&
  gameState.players[playerName].role.actions.firstNight?.name === 'inform' ? (
    <button onClick={() => sendAction({type: 'ROLE_ACTION'})}>Inform</button>
  ) : (
    <></>
  )

export default Game
