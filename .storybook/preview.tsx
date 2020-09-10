import React from 'react'
import 'typeface-pt-sans'
import 'typeface-pt-sans-caption'
import 'typeface-pt-serif-caption'

import '../src/client/styles.css'

export const decorators = [
  (Story: any) => (
    <div className="h-screen bg-surface-0 text-white">
      <Story />
    </div>
  ),
]

export const parameters = {
  actions: {argTypesRegex: '^(on|handle)[A-Z].*'},
}
