import React, {useState} from 'react'

interface Props {
  playerName: string
  roomId: string
  socket: SocketIOClient.Socket
}

const Game = (props: Props) => {
  const [players, setPlayers] = useState([props.playerName])
  props.socket.on('roomPlayers', (players: string[]) => {
    setPlayers(players)
  })
  return (
    <>
      <h1>Game</h1>
      <ul>
        {players.map(player => (
          <li>{player}</li>
        ))}
      </ul>
    </>
  )
}

export default Game
