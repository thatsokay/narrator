import React from 'react'
import {Story, Meta} from '@storybook/react'
import {action} from '@storybook/addon-actions'

import HomePage from './HomePage'

const meta: Meta = {
  title: 'Components/HomePage',
  component: HomePage,
}

const Template: Story<Parameters<typeof HomePage>[0]> = (args) => (
  <HomePage {...args} />
)

export const Index = Template.bind({})
Index.args = {
  submitForm: action('submitForm'),
}

export default meta
