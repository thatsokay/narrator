import React, {useState} from 'react'

interface Props {
  handleSubmit: (
    playerName: string,
    roomId?: string,
  ) => (event: React.FormEvent) => void
}

const CreateForm = ({handleSubmit}: Props) => {
  const [playerName, setPlayerName] = useState('')

  return (
    <form onSubmit={handleSubmit(playerName)}>
      <label htmlFor="create-player-name">Player name</label>
      <input
        className="w-full mb-6"
        value={playerName}
        onChange={event => setPlayerName(event.target.value)}
        id="create-player-name"
        type="text"
        name="player-name"
        maxLength={12}
      />
      <div className="flex justify-end">
        <button className="btn bg-primary">Start</button>
      </div>
    </form>
  )
}

export default CreateForm
