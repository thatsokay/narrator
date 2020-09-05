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
      <label
        className="px-1 text-xs text-grey-400 uppercase"
        htmlFor="join-room-id"
      >
        Room code
      </label>
      <input
        className="w-full px-1 mb-6 bg-transparent border-b border-gray-400 rounded-sm"
        value={roomId}
        onChange={event => setRoomId(event.target.value)}
        id="join-room-id"
        type="text"
        name="room-id"
        maxLength={4}
      />
      <label
        className="px-1 text-xs text-grey-400 uppercase"
        htmlFor="join-player-name"
      >
        Player name
      </label>
      <input
        className="w-full px-1 mb-6 bg-transparent border-b border-gray-400 rounded-sm"
        value={playerName}
        onChange={event => setPlayerName(event.target.value)}
        id="join-player-name"
        type="text"
        name="player-name"
        maxLength={12}
      />
      <div className="flex justify-end">
        <button className="px-4 py-2 bg-primary rounded-xs text-sm uppercase">
          Join room
        </button>
      </div>
    </form>
  )
}

export default JoinForm
