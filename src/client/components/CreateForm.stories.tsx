import React from 'react'
import {Meta} from '@storybook/react/types-6-0'

import CreateForm from './CreateForm'

const meta: Meta = {title: 'Components/CreateForm', component: CreateForm}

export const Index = () => (
  <CreateForm handleSubmit={() => e => e.preventDefault()} />
)

export default meta
