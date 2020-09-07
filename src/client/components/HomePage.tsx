import React, {useState} from 'react'

import StartForm from './StartForm'

interface Props {
  submitForm: (form: {playerName: string; roomId?: string}) => void
}

const HomePage: React.FC<Props> = ({submitForm}) => {
  const [selectedForm, setSelectedForm] = useState<'create' | 'join'>('create')
  const handleShowFormClickFactory = (form: typeof selectedForm) => (
    event: React.MouseEvent<HTMLAnchorElement>,
  ) => {
    event.preventDefault()
    setSelectedForm(form)
  }

  const [playerName, setPlayerName] = useState('')
  const [roomId, setRoomId] = useState('')
  const handleSubmit = () => submitForm({playerName, roomId})

  return (
    <>
      <div className="pb-6 flex justify-center -space-x-px">
        <a
          id="create-room-form"
          className={
            'btn block border border-grey-200 rounded-r-none text-center no-underline ' +
            (selectedForm === 'create'
              ? 'text-black bg-grey-200'
              : 'text-white')
          }
          onClick={handleShowFormClickFactory('create')}
          href="#"
        >
          New room
        </a>
        <a
          id="join-room-form"
          className={
            'btn block border border-grey-200 rounded-l-none text-center no-underline ' +
            (selectedForm === 'join' ? 'text-black bg-grey-200' : 'text-white')
          }
          onClick={handleShowFormClickFactory('join')}
          href="#"
        >
          Join room
        </a>
      </div>
      <StartForm
        handleSubmit={handleSubmit}
        playerName={{value: playerName, set: setPlayerName}}
        roomId={
          selectedForm === 'join' ? {value: roomId, set: setRoomId} : undefined
        }
      />
    </>
  )
}

export default HomePage
