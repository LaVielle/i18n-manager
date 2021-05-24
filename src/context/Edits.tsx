import React, { useContext, useEffect, useState } from 'react'

import translations from '../data-long.json'
import { flattenObject, normalizeDataShape, NormalizedObject } from '../utils/dataTransformers'
import { useLocalStorage } from '../utils/useLocalStorage'

type FlatObject = {
  [key: string]: string
}

type EditsContextType = {
  numberOfEdits: number
  allEdits: FlatObject
  setEdit: (key: string, value: string) => void
  mergedFlatTranslations: FlatObject
  formattedTranslations: NormalizedObject | null
}

const EditsContext = React.createContext<EditsContextType>({} as EditsContextType)

export const EditsContextProvider: React.FC = ({ children }) => {
  const [numberOfEdits, setNumberOfEdits] = useState(0)

  // state to hold the original translation file, as it was before edits
  const [sourceFlatTranslations, setSourceFlatTranslations] = useLocalStorage(
    'sourceFlatTranslations',
    {}
  )
  const [mergedFlatTranslations, setMergedFlatTranslations] = useState<FlatObject>({})
  const [formattedTranslations, setFormattedTranslations] = useState<NormalizedObject | null>(null)

  const [allEdits, setAllEdits] = useLocalStorage('allEdits', {})

  const [keysWithRealDiff, setKeysWithRealDiff] = useState({})

  useEffect(() => {
    const flatSource = flattenObject(translations)

    const merged = {
      ...flatSource,
      ...allEdits,
    }

    const formatted = normalizeDataShape(merged)

    setSourceFlatTranslations(flatSource)
    setMergedFlatTranslations(merged)
    setFormattedTranslations(formatted)
  }, [])

  const setEdit = (key: string, value: string) => {
    setAllEdits((prevAllEdits) => ({
      ...prevAllEdits,
      [key]: value,
    }))
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
        mergedFlatTranslations,
        formattedTranslations,
      }}
    >
      {children}
    </EditsContext.Provider>
  )
}

export const useEdits = (): EditsContextType => useContext(EditsContext)
