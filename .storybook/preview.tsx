import React from 'react'
import {addDecorator} from '@storybook/react'
import 'typeface-pt-sans'
import 'typeface-pt-sans-caption'
import 'typeface-pt-serif-caption'

import '../src/client/styles.css'

addDecorator(storyFn => (
  <div className="h-screen bg-surface-0 text-white">{storyFn()}</div>
))
