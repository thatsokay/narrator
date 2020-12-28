import React, {useState, useEffect, useCallback} from 'react'
import {Observable} from 'rxjs'

import {
  GameState,
  initialState,
  countLynchVotes,
  countVoterPopulation,
} from '../../shared/game/reducer'
import {ClientAction} from '../../shared/game/actions'

/**
 * Subscribes to the given observable and returns the latest game state.
 */
const useGameState = (gameState$: Observable<GameState>) => {
  // Initialise and subscribe to game state
  const [gameState, setGameState] = useState<GameState>(initialState)
  useEffect(() => {
    const subscription = gameState$.subscribe((state) => setGameState(state))
    return () => subscription.unsubscribe()
  }, [gameState$])
  return gameState
}

/**
 * Returns a lynch vote state that sends actions to the server on change and
 * resets on game status change.
 */
const useLynchVoteState = (
  gameState: GameState,
  sendAction: (action: ClientAction) => void,
) => {
  // Player that this client is voting to kill.
  // `null` is a vote to lynch no-one, `undefined` is no vote.
  const lynchVoteState = useState<string | null | undefined>(undefined)
  const [lynchVote, setLynchVote] = lynchVoteState
  // Reset lynch vote on game status change.
  useEffect(() => setLynchVote(undefined), [gameState.status])
  // Send action to server on vote change.
  useEffect(() => {
    if (lynchVote !== undefined) {
      sendAction({type: 'day/lynch', lynch: lynchVote})
    }
  }, [lynchVote, sendAction])
  return lynchVoteState
}

interface Props {
  playerName: string
  roomId: string
  gameState$: Observable<GameState>
  sendAction: (action: ClientAction) => void
}

const Game = (props: Props) => {
  // Initialise and subscribe to game state.
  const gameState = useGameState(props.gameState$)
  const [lynchVote, setLynchVote] = useLynchVoteState(
    gameState,
    props.sendAction,
  )

  const lynchVoteCounts = countLynchVotes(gameState)
  const voterPopulation = countVoterPopulation(gameState)

  // Returns an event handler to cast a lynch vote on a player.
  const handleLynchChangeFactory = useCallback(
    (player: string) => () => setLynchVote(player),
    [setLynchVote],
  )

  return (
    <div id="game">
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
            {gameState.players[props.playerName]!.role.name}
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
                          // Reach 100% width at 50% + 1 vote.
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
    </div>
  )
}

interface ActionableProps extends Omit<Props, 'gameState$'> {
  gameState: GameState
}

const ReadyActionable = ({gameState, sendAction}: ActionableProps) =>
  gameState.status === 'waiting' ? (
    <button onClick={() => sendAction({type: 'waiting/ready'})}>Ready</button>
  ) : (
    <></>
  )

const InformActionable = ({
  gameState,
  playerName,
  sendAction,
}: ActionableProps) =>
  gameState.status === 'firstNight' &&
  gameState.players[playerName]?.role.name === gameState.awake &&
  gameState.players[playerName]?.role.actions.firstNight?.name === 'inform' ? (
    <button onClick={() => sendAction({type: 'night/inform'})}>Inform</button>
  ) : (
    <></>
  )

export default Game
