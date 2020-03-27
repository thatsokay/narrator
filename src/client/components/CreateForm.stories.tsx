import React from 'react'

import CreateForm from './CreateForm'

export default {title: 'CreateForm'}

export const index = () => (
  <CreateForm handleSubmit={() => e => e.preventDefault()} />
)
