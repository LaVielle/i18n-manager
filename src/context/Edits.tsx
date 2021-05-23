import React, { useContext, useState } from 'react'

import { useLocalStorage } from '../utils/useLocalStorage'

const allEditsKey = 'allEdits'

type EditsContextType = {
  numberOfEdits: number
  getEdits: () => void
  setEdit: (key: string, value: string) => void
}

const EditsContext = React.createContext<EditsContextType>({} as EditsContextType)

export const EditsContextProvider: React.FC = ({ children }) => {
  const [numberOfEdits, setNumberOfEdits] = useState(0)

  const [allEdits, setAllEdits] = useLocalStorage(allEditsKey, {})

  const getEdits = () => {}

  const setEdit = (key: string, value: string) => {
    console.log({ key, value })
    setAllEdits({
      ...allEdits,
      [key]: value,
    })
  }

  return (
    <EditsContext.Provider
      value={{
        numberOfEdits,
        getEdits,
        setEdit,
      }}
    >
      {children}
    </EditsContext.Provider>
  )
}

export const useEdits = (): EditsContextType => {
  const editsContext = useContext(EditsContext)
  return editsContext
}
