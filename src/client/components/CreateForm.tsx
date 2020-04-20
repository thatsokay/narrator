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
        className="w-full px-1 border border-black"
        value={playerName}
        onChange={event => setPlayerName(event.target.value)}
        id="create-player-name"
        type="text"
        name="player-name"
        maxLength={12}
      />
      <button className="p-2">Create room</button>
    </form>
  )
}

export default CreateForm
