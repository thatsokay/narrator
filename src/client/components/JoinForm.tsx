import React, {useState} from 'react'

interface Props {
  handleSubmit: (
    playerName: string,
    roomId?: string,
  ) => (event: React.FormEvent) => void
}

const JoinForm = (props: Props) => {
  const [roomId, setRoomId] = useState('')
  const [playerName, setPlayerName] = useState('')

  return (
    <form onSubmit={props.handleSubmit(playerName, roomId)}>
      <label htmlFor="join-room-id">Room code</label>
      <input
        value={roomId}
        onChange={event => setRoomId(event.target.value)}
        id="join-room-id"
        type="text"
        name="room-id"
        maxLength={4}
      />
      <label htmlFor="join-player-name">Player name</label>
      <input
        value={playerName}
        onChange={event => setPlayerName(event.target.value)}
        id="join-player-name"
        type="text"
        name="player-name"
        maxLength={12}
      />
      <button>Join room</button>
    </form>
  )
}

export default JoinForm
