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

  const lynchVoteCounts = countLynchVote(gameState)
  const voterPopulation =
    gameState.status === 'day'
      ? Object.values(gameState.players).filter(
          ({alive, role}) => alive && role.actions.day?.name === 'lynch',
        ).length
      : 0

  const handleLynchClickFactory = useCallback(
    (player: string) => (event: React.MouseEvent) => {
      event.preventDefault()
      props.sendAction({type: 'ROLE_ACTION', lynch: player})
    },
    [props.sendAction],
  )

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
          Object.entries(gameState.players).map(([player, playerState]) => {
            const lynchVotes = lynchVoteCounts[player] || 0
            return (
              <li className="flex justify-between relative" key={player}>
                <div
                  className="absolute bg-lightest-blue h-100"
                  style={{
                    width: `${Math.min(
                      100,
                      // Reach 100% width at 50% + 1 vote
                      (100 * lynchVotes) /
                        (Math.floor(voterPopulation / 2) + 1),
                    )}%`,
                  }}
                ></div>
                <div className="relative">
                  <button
                    onClick={handleLynchClickFactory(player)}
                    className="dib b--none pa0 ma0 bg-inherit color-inherit no-underline"
                  >
                    🔪
                  </button>
                  {player}
                  {playerState.alive ? ' 🙂' : ' 💀'}
                </div>
                <div className="relative">
                  {Math.floor((100 * lynchVotes) / voterPopulation)}%
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
