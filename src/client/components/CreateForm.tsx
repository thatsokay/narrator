import React, {useState} from 'react'

interface Props {
  handleSubmit: (
    playerName: string,
    roomId?: string,
  ) => (event: React.FormEvent) => void
}

const CreateForm = (props: Props) => {
  const [playerName, setPlayerName] = useState('')

  return (
    <form onSubmit={props.handleSubmit(playerName)}>
      <label htmlFor="create-player-name">Player name</label>
      <input
        value={playerName}
        onChange={event => setPlayerName(event.target.value)}
        id="create-player-name"
        className="w-100"
        type="text"
        name="player-name"
        maxLength={12}
      />
      <button>Create room</button>
    </form>
  )
}

export default CreateForm
