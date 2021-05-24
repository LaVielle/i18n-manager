import React, { useContext, useEffect, useState } from 'react'

import { useLocalStorage } from '../utils/useLocalStorage'

const allEditsKey = 'allEdits'

type EditsContextType = {
  numberOfEdits: number
  allEdits: { [key: string]: string }
  setEdit: (key: string, value: string) => void
  setSourceFlatTranslations: (data: { [key: string]: string }) => void
}

const EditsContext = React.createContext<EditsContextType>({} as EditsContextType)

export const EditsContextProvider: React.FC = ({ children }) => {
  const [numberOfEdits, setNumberOfEdits] = useState(0)

  // state to hold the original translation file, as it was before edits
  const [sourceFlatTranslations, setSourceFlatTranslations] = useState<{ [key: string]: string }>(
    {}
  )

  const [allEdits, setAllEdits] = useLocalStorage(allEditsKey, {})
  const [keysWithRealDiff, setKeysWithRealDiff] = useState({})

  const setEdit = (key: string, value: string) => {
    setAllEdits({
      ...allEdits,
      [key]: value,
    })
  }

  useEffect(() => {
    const newKeysWithRealDiff = {}
    Object.keys(allEdits).forEach((key) => {
      if (allEdits[key] !== sourceFlatTranslations[key]) {
        newKeysWithRealDiff[key] = allEdits[key]
      }
    })

    setKeysWithRealDiff(newKeysWithRealDiff)
  }, [allEdits])

  useEffect(() => {
    setNumberOfEdits(Object.keys(keysWithRealDiff).length)
  }, [keysWithRealDiff])

  return (
    <EditsContext.Provider
      value={{
        numberOfEdits,
        allEdits,
        setEdit,
        setSourceFlatTranslations,
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
