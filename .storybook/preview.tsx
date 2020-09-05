import React from 'react'
import {addDecorator} from '@storybook/react'
import '../src/client/styles.css'

addDecorator(storyFn => (
  <div className="h-screen bg-surface-0 text-white">{storyFn()}</div>
))
