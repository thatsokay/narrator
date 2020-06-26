import React, {useState, useEffect, useCallback} from 'react'
import {Observable} from 'rxjs'
import * as R from 'ramda'

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

  // `null` is a vote to lynch no-one, `undefined` is no vote
  const [lynchVote, setLynchVote] = useState<string | null | undefined>(
    undefined,
  )
  // Reset lynch vote on game status change
  useEffect(() => setLynchVote(undefined), [gameState.status])
  const lynchVoteCounts = countLynchVote(gameState)
  const voterPopulation =
    gameState.status === 'day'
      ? Object.values(gameState.players).filter(
          ({alive, role}) => alive && role.actions.day?.name === 'lynch',
        ).length
      : 0

  const handleLynchChangeFactory = useCallback(
    (player: string) => () => {
      props.sendAction({type: 'ROLE_ACTION', lynch: player})
      setLynchVote(player)
    },
    [props.sendAction, setLynchVote],
  )

  return (
    <>
      <div className="flex justify-between">
        <h2 className="capitalize text-xl font-medium">
          {gameState.status === 'firstNight' ? 'night' : gameState.status}
        </h2>
        <h2 id="room-id" className="text-xl font-medium">
          {props.roomId}
        </h2>
      </div>
      {gameState.status !== 'waiting' && (
        <div>
          <span className="text-gray-400 bg-gray-400">
            {gameState.players[props.playerName].role.name}
          </span>
        </div>
      )}
      {(gameState.status === 'firstNight' || gameState.status === 'night') && (
        <p>
          Awake:{' '}
          <span className="capitalize">{gameState.awake ?? 'nobody'}</span>
        </p>
      )}
      <InformActionable {...{...props, gameState}} />
      <ReadyActionable {...{...props, gameState}} />
      <ul>
        {gameState.status === 'waiting' &&
          Object.entries(gameState.players).map(([player, playerState]) => (
            <li className="flex justify-between" key={player}>
              <div>{player}</div>
              <div>{playerState.ready ? 'Ready' : 'Not ready'}</div>
            </li>
          ))}
        {gameState.status === 'day' &&
          Object.entries(gameState.players).map(([player, playerState]) => {
            const lynchVotes = lynchVoteCounts[player] || 0
            return (
              <li className="flex space-x-1" key={player}>
                <input
                  id={player}
                  type="radio"
                  onChange={handleLynchChangeFactory(player)}
                  checked={lynchVote === player}
                  disabled={!playerState.alive}
                />
                <div className="flex justify-between flex-1 relative">
                  {playerState.alive && (
                    <div
                      className="absolute bg-blue-200 h-full"
                      style={{
                        width: `${Math.min(
                          100,
                          // Reach 100% width at 50% + 1 vote
                          (100 * lynchVotes) /
                            (Math.floor(voterPopulation / 2) + 1),
                        )}%`,
                      }}
                    ></div>
                  )}
                  <label className="relative px-1" htmlFor={player}>
                    <span
                      className={
                        playerState.alive ? '' : 'text-gray-600 line-through'
                      }
                    >
                      {player}
                    </span>
                  </label>
                  {playerState.alive && (
                    <div className="relative">
                      {Math.floor((100 * lynchVotes) / voterPopulation)}%
                    </div>
                  )}
                </div>
              </li>
            )
          })}
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
  const votes = Object.values(gameState.players)
    .filter(
      ({alive, role}) =>
        alive &&
        role.actions.day?.name === 'lynch' &&
        role.actions.day?.completed,
    )
    .map(({role}) => role.actions.day!.lynch)
  // Use empty string to represent `null` lynch vote
  // Assumes empty string is not a possible player name
  return R.countBy(x => x || '', votes)
}

export default Game
