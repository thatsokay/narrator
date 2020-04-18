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

  const lynchVoteCount = countLynchVote(gameState)
  const aliveCount = Object.keys(gameState.players).length

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
      <ul className="list pa0">
        {gameState.status === 'waiting' &&
          Object.entries(gameState.players).map(([player, playerState]) => (
            <li key={player}>
              {player}
              {playerState.ready && ': Ready'}
            </li>
          ))}
        {gameState.status === 'day' &&
          Object.entries(gameState.players).map(([player, playerState]) => (
            <li className="flex justify-between" key={player}>
              <div>
                {player}
                {playerState.alive ? ' 🙂' : ' 💀'}
              </div>
              <div>
                {Math.floor((lynchVoteCount[player] / aliveCount) * 100)}%
              </div>
            </li>
          ))}
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

const countLynchVote = (gameState: GameState) => {
  if (gameState.status !== 'day') {
    return {}
  }
  const initialAcc = Object.keys(gameState.players).reduce(
    (acc: Record<string, number>, player) => {
      acc[player] = 0
      return acc
    },
    {'': 0},
  )
  return Object.values(gameState.players).reduce(
    (acc: Record<string, number>, playerState) => {
      if (!playerState.alive) {
        return acc
      }
      if (playerState.role.actions.day?.completed) {
        // Player hasn't voted
        return acc
      }
      const target = playerState.role.actions.day?.lynch
        ? playerState.role.actions.day?.lynch
        : '' // Use empty string to represent `null` as object key
      if (!acc[target]) {
        acc[target] = 1
      } else {
        acc[target] += 1
      }
      return acc
    },
    initialAcc,
  )
}

export default Game
