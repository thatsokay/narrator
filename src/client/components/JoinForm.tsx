import React, {useState, FormEvent} from 'react'

interface Props {
  handleSubmit: (roomId: string, playerName: string) => void
}

const JoinForm = (props: Props) => {
  const [roomId, setRoomId] = useState('')
  const [playerName, setPlayerName] = useState('')

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    props.handleSubmit(roomId, playerName)
  }

  return (
    <form onSubmit={handleSubmit}>
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
