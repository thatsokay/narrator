import React from 'react'

interface Props {
  playerName: string
  roomId: string
  socket: SocketIOClient.Socket
}

// TODO: Remove
// @ts-ignore
const Game = (props: Props) => {
  return <div>Game</div>
}

export default Game
