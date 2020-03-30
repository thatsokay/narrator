import React from 'react'
import {BehaviorSubject} from 'rxjs'
import {action} from '@storybook/addon-actions'
import {withKnobs, radios} from '@storybook/addon-knobs'

import Game from './Game'
import {GameState} from '../../shared/game'
import {ROLES} from '../../shared/roles'

export default {title: 'Game', decorators: [withKnobs]}

const GameDefault = ({gameState}: {gameState: GameState}) => (
  <Game
    playerName="player0"
    roomId="ROOM"
    gameState$={new BehaviorSubject(gameState)}
    sendAction={action('sendAction')}
  />
)

export const waiting = () => {
  const gameState: GameState = {
    status: 'waiting',
    players: {
      player0: {ready: false},
      player1: {ready: false},
      player2: {ready: false},
      player3: {ready: false},
      player4: {ready: true},
      player5: {ready: true},
    },
    error: null,
  }
  return <GameDefault gameState={gameState} />
}

export const firstNight = () => {
  const playerRole = radios(
    'Player role',
    {
      Villager: 'villager',
      Mafia: 'mafia',
      Detective: 'detective',
      Nurse: 'nurse',
    },
    'mafia',
  )
  const awake = radios(
    'Awake',
    {
      // Radio deselects if value is null
      Nobody: 'null',
      Mafia: 'mafia',
    },
    'mafia',
  )
  const gameState: GameState = {
    status: 'firstNight',
    players: {
      player0: {alive: true, role: ROLES[playerRole]},
      player1: {alive: true, role: ROLES.villager},
      player2: {alive: true, role: ROLES.villager},
      player3: {alive: true, role: ROLES.detective},
      player4: {alive: true, role: ROLES.nurse},
      player5: {alive: true, role: ROLES.mafia},
    },
    error: null,
    awake: awake === 'null' ? null : awake,
  }
  return <GameDefault gameState={gameState} />
}
