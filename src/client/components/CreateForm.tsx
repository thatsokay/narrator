import React, {useState, FormEvent} from 'react'

interface Props {
  handleSubmit: (playerName: string) => void
}

const CreateForm = (props: Props) => {
  const [playerName, setPlayerName] = useState('')

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    props.handleSubmit(playerName)
  }

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor="create-player-name">Player name</label>
      <input
        value={playerName}
        onChange={event => setPlayerName(event.target.value)}
        id="create-player-name"
        type="text"
        name="player-name"
        maxLength={12}
      />
      <button>Create room</button>
    </form>
  )
}

export default CreateForm
