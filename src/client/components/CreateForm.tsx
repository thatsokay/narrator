import React, {useState} from 'react'

interface Props {
  submitForm: (playerName: string, roomId?: string) => void
}

const CreateForm = ({submitForm}: Props) => {
  const [playerName, setPlayerName] = useState('')
  return (
    <form
      onSubmit={event => {
        event.preventDefault()
        submitForm(playerName)
      }}
    >
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
