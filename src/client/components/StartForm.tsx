import React from 'react'

const preventDefaultEnhancer = (
  handler: React.EventHandler<React.FormEvent>,
) => (event: React.FormEvent) => {
  event.preventDefault()
  handler(event)
}

const handleChangeFactory = (
  dispatch: React.Dispatch<React.SetStateAction<string>>,
) =>
  preventDefaultEnhancer((event: React.ChangeEvent<HTMLInputElement>) =>
    dispatch(event.target.value),
  )

interface Props {
  handleSubmit: React.EventHandler<React.FormEvent>
  playerName: {
    value: string
    set: React.Dispatch<React.SetStateAction<string>>
  }
  roomId?: {
    value: string
    set: React.Dispatch<React.SetStateAction<string>>
  }
}

const StartForm: React.FC<Props> = ({handleSubmit, playerName, roomId}) => (
  <form onSubmit={preventDefaultEnhancer(handleSubmit)}>
    <label htmlFor="create-player-name">Player name</label>
    <input
      className="w-full mb-6"
      value={playerName.value}
      onChange={handleChangeFactory(playerName.set)}
      id="create-player-name"
      type="text"
      name="player-name"
      maxLength={12}
    />
    {roomId && (
      <>
        <label htmlFor="room-id">Room code</label>
        <input
          className="w-full mb-6"
          value={roomId.value}
          onChange={handleChangeFactory(roomId.set)}
          id="room-id"
          type="text"
          name="room-id"
          maxLength={4}
        />
      </>
    )}
    <div className="flex justify-end">
      <button className="btn bg-primary">Start</button>
    </div>
  </form>
)

export default StartForm
