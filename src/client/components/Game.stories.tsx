import React from 'react'
import {BehaviorSubject} from 'rxjs'

import Game from './Game'
import {initialState} from '../../shared/game'

export default {title: 'Game'}

export const initial = () => (
  <Game
    playerName="player"
    roomId="ROOM"
    gameState$={new BehaviorSubject(initialState)}
    sendAction={() => {}}
  />
)
