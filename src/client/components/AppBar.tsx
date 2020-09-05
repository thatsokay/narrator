import React from 'react'

const AppBar: React.FC<React.HTMLAttributes<HTMLElement>> = props => (
  <header {...props}>
    <div className="px-4 py-2 flex justify-center bg-surface-4 text-lg font-serif uppercase">
      Narrator
    </div>
  </header>
)

export default AppBar
