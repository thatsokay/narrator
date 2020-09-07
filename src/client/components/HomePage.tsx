import React, {useState} from 'react'

import CreateForm from './CreateForm'
import JoinForm from './JoinForm'

interface Props {
  submitForm: (playerName: string, roomId?: string) => void
}

const HomePage: React.FC<Props> = ({submitForm}) => {
  const [showForm, setShowForm] = useState<'create' | 'join'>('create')

  const handleShowFormClickFactory = (form: typeof showForm) => (
    event: React.MouseEvent<HTMLAnchorElement>,
  ) => {
    event.preventDefault()
    setShowForm(form)
  }

  return (
    <>
      <div className="pb-6 flex justify-center -space-x-px">
        <a
          id="create-room-form"
          className={
            'btn block border border-grey-200 rounded-r-none no-underline ' +
            (showForm === 'create' ? 'text-black bg-grey-200' : 'text-white')
          }
          onClick={handleShowFormClickFactory('create')}
          href="#"
        >
          New room
        </a>
        <a
          id="join-room-form"
          className={
            'btn block border border-grey-200 rounded-l-none no-underline ' +
            (showForm === 'join' ? 'text-black bg-grey-200' : 'text-white')
          }
          onClick={handleShowFormClickFactory('join')}
          href="#"
        >
          Join room
        </a>
      </div>
      {showForm === 'create' ? (
        <CreateForm submitForm={submitForm} />
      ) : (
        <JoinForm submitForm={submitForm} />
      )}
    </>
  )
}

export default HomePage
