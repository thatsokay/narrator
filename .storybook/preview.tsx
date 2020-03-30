import React from 'react'
import {addDecorator} from '@storybook/react'
import 'tachyons/css/tachyons.min.css'

addDecorator(storyFn => (
  <div className="w-100 w5-ns ph4 ph0-ns" style={{marginLeft: 'auto', marginRight: 'auto'}}>
    {storyFn()}
  </div>
))
