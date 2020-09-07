import React from 'react'
import {Meta} from '@storybook/react/types-6-0'

import StartForm from './StartForm'

const meta: Meta = {title: 'Components/StartForm', component: StartForm}

export const CreateRoom = () => (
  <StartForm handleSubmit={() => {}} playerName={{value: '', set: () => {}}} />
)

export const JoinRoom = () => (
  <StartForm
    handleSubmit={() => {}}
    playerName={{value: '', set: () => {}}}
    roomId={{value: '', set: () => {}}}
  />
)

export default meta
