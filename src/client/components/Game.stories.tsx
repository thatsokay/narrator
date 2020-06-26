import React from 'react'
import {BehaviorSubject} from 'rxjs'
import {action} from '@storybook/addon-actions'
import {withKnobs, radios} from '@storybook/addon-knobs'
import * as R from 'ramda'

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
  const readiness = [false, false, false, false, true, true]
  const players = R.fromPairs(
    readiness.map((ready, i) => [`player${i}`, {ready}]),
  )
  const gameState: GameState = {
    status: 'waiting',
    players,
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
      Nobody: 'null', // Radio deselects if value is null
      Mafia: 'mafia',
    },
    'mafia',
  )
  const roles = [
    ROLES[playerRole],
    ROLES.villager,
    ROLES.villager,
    ROLES.detective,
    ROLES.nurse,
    ROLES.mafia,
  ]
  const players = R.fromPairs(
    roles.map((role, i) => [`player${i}`, {alive: true, role}]),
  )
  const gameState: GameState = {
    status: 'firstNight',
    players,
    error: null,
    awake: awake === 'null' ? null : awake,
  }
  return <GameDefault gameState={gameState} />
}

export const day = () => {
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
  const playerLynchVote = radios(
    'Player lynch vote',
    {
      Nobody: 'null',
      player1: 'player1',
    },
    'null',
  )
  const playerStates = [
    {role: ROLES[playerRole], alive: true},
    {role: ROLES.villager, alive: true},
    {role: ROLES.villager, alive: false},
    {role: ROLES.detective, alive: true},
    {role: ROLES.nurse, alive: true},
    {role: ROLES.mafia, alive: true},
  ]
  let players = R.fromPairs(
    playerStates.map((state, i) => [`player${i}`, state]),
  )
  // XXX: `assocPath` can produce invalid state
  players = R.assocPath(
    ['player0', 'role', 'actions', 'day', 'lynch'],
    playerLynchVote === 'null' ? null : playerLynchVote,
    players,
  )
  // XXX: `assocPath` can produce invalid state
  players = R.assocPath(
    ['player0', 'role', 'actions', 'day', 'completed'],
    true,
    players,
  )
  const gameState: GameState = {
    status: 'day',
    players,
    error: null,
  }
  return <GameDefault gameState={gameState} />
}
