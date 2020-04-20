import React from 'react'
import {addDecorator} from '@storybook/react'
import '../src/client/styles.css'

addDecorator(storyFn => (
  <div className="w-full sm:w-64 px-8 sm:px-0 sm:mx-auto">{storyFn()}</div>
))
