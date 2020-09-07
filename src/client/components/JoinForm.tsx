import React, {useState} from 'react'

interface Props {
  submitForm: (playerName: string, roomId?: string) => void
}

const JoinForm = ({submitForm}: Props) => {
  const [roomId, setRoomId] = useState('')
  const [playerName, setPlayerName] = useState('')

  return (
    <form
      onSubmit={event => {
        event.preventDefault()
        submitForm(playerName, roomId)
      }}
    >
      <label htmlFor="join-player-name">Player name</label>
      <input
        className="w-full mb-6"
        value={playerName}
        onChange={event => setPlayerName(event.target.value)}
        id="join-player-name"
        type="text"
        name="player-name"
        maxLength={12}
      />
      <label htmlFor="join-room-id">Room code</label>
      <input
        className="w-full mb-6"
        value={roomId}
        onChange={event => setRoomId(event.target.value)}
        id="join-room-id"
        type="text"
        name="room-id"
        maxLength={4}
      />
      <div className="flex justify-end">
        <button className="btn bg-primary">Start</button>
      </div>
    </form>
  )
}

export default JoinForm
