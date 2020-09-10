import React from 'react'
import {Story, Meta} from '@storybook/react'

import StartForm from './StartForm'

const meta: Meta = {title: 'Components/StartForm', component: StartForm}

const Template: Story<Parameters<typeof StartForm>[0]> = (args) => (
  <StartForm {...args} />
)

export const CreateRoom = Template.bind({})
CreateRoom.args = {
  playerName: {
    value: '',
    set: () => {},
  },
}

export const JoinRoom = Template.bind({})
JoinRoom.args = {
  playerName: {
    value: '',
    set: () => {},
  },
  roomId: {
    value: '',
    set: () => {},
  },
}

export default meta
