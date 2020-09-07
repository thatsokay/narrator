import React from 'react'
import {Meta} from '@storybook/react/types-6-0'

import JoinForm from './JoinForm'

const meta: Meta = {title: 'Components/JoinForm', component: JoinForm}

export const Index = () => <JoinForm submitForm={() => {}} />

export default meta
