import React from 'react'
import {BehaviorSubject} from 'rxjs'

import Game from './Game'
import {GameState} from '../../shared/game'
import {ROLES} from '../../shared/roles'

export default {title: 'Game'}

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
  return (
    <Game
      playerName="player"
      roomId="ROOM"
      gameState$={new BehaviorSubject(gameState)}
      sendAction={() => {}}
    />
  )
}

export const firstNight = () => {
  const gameState: GameState = {
    status: 'firstNight',
    players: {
      player0: {alive: true, role: ROLES.villager},
      player1: {alive: true, role: ROLES.villager},
      player2: {alive: true, role: ROLES.detective},
      player3: {alive: true, role: ROLES.nurse},
      player4: {alive: true, role: ROLES.mafia},
      player5: {alive: true, role: ROLES.mafia},
    },
    error: null,
    awake: null,
  }
  return (
    <Game
      playerName="player0"
      roomId="ROOM"
      gameState$={new BehaviorSubject(gameState)}
      sendAction={() => {}}
    />
  )
}
