import React from 'react'
import {Meta} from '@storybook/react/types-6-0'

import HomePage from './HomePage'

const meta: Meta = {title: 'Components/HomePage', component: HomePage}

export const Index = () => (
  <HomePage handleSubmitFactory={() => e => e.preventDefault()} />
)

export default meta
