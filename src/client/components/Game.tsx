import React, {useState, useEffect} from 'react'
import {BehaviorSubject} from 'rxjs'

import {GameState} from '../../shared/game'

interface Props {
  playerName: string
  roomId: string
  gameState$: BehaviorSubject<GameState>
}

const Game = (props: Props) => {
  const [players, setPlayers] = useState<string[]>([])
  useEffect(() => {
    const subscription = props.gameState$.subscribe(state =>
      setPlayers(Object.keys(state.players)),
    )
    return () => subscription.unsubscribe()
  }, [props.gameState$])
  return (
    <>
      <h1>{props.roomId}</h1>
      <ul>
        {players.map(player => (
          <li>{player}</li>
        ))}
      </ul>
    </>
  )
}

export default Game
