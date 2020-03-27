import React from 'react'

import JoinForm from './JoinForm'

export default {title: 'JoinForm'}

export const index = () => (
  <JoinForm handleSubmit={() => e => e.preventDefault()} />
)
