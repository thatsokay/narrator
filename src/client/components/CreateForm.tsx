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
      <label
        className="px-1 text-xs text-grey-400 font-label uppercase"
        htmlFor="create-player-name"
      >
        Player name
      </label>
      <input
        className="w-full px-1 mb-6 bg-transparent border-b border-gray-400 rounded-sm"
        value={playerName}
        onChange={event => setPlayerName(event.target.value)}
        id="create-player-name"
        type="text"
        name="player-name"
        maxLength={12}
      />
      <div className="flex justify-end">
        <button className="px-4 py-2 bg-primary rounded-xs text-sm font-label uppercase">
          Create room
        </button>
      </div>
    </form>
  )
}

export default CreateForm
