import exportFromJSON from 'export-from-json'
import { useRouter } from 'next/router'
import React, { useContext, useEffect, useState } from 'react'

import {
  flattenObject,
  getDataFromFlatKeyId,
  normalizeDataShape,
  NormalizedObject,
  unflattenObject,
} from '../utils/dataTransformers'
import { useLocalStorage } from '../utils/useLocalStorage'

type FlatObject = {
  [key: string]: string
}

type EditsContextType = {
  numberOfEdits: number
  allEdits: FlatObject
  setEdit: (key: string, value: string) => void
  namespacesWithRealDiff: { [key: string]: boolean }
  formattedTranslations: NormalizedObject | null
  addSourceFile: (translations: string) => void
  downloadTargetJson: () => void
}

const EditsContext = React.createContext<EditsContextType>({} as EditsContextType)

export const EditsContextProvider: React.FC = ({ children }) => {
  const router = useRouter()

  const [numberOfEdits, setNumberOfEdits] = useState(0)

  // state to hold the original translation file, as it was before edits
  const [sourceFlatTranslations, setSourceFlatTranslations] = useLocalStorage(
    'sourceFlatTranslations',
    {}
  )

  useEffect(() => {
    // Navigate to the start page if there is no source file yet
    if (!Object.keys(sourceFlatTranslations).length && router.pathname !== '/start') {
      router.push('start').then()
    }
  }, [sourceFlatTranslations])

  const [formattedTranslations, setFormattedTranslations] = useState<NormalizedObject | null>(null)

  const [allEdits, setAllEdits] = useLocalStorage('allEdits', {})

  const [keysWithRealDiff, setKeysWithRealDiff] = useState({})

  const namespacesWithRealDiff = Object.keys(keysWithRealDiff).reduce((acc, flatKeyId) => {
    const { namespace } = getDataFromFlatKeyId(flatKeyId)
    return {
      ...acc,
      [namespace]: true,
    }
  }, {})

  const addSourceFile = (translations: string) => {
    const flatSource = flattenObject(translations)
    setSourceFlatTranslations(flatSource)
  }

  useEffect(() => {
    // Navigate to the start page if there is no source file yet
    if (!Object.keys(sourceFlatTranslations).length && router.pathname !== '/start') {
      router.push('start').then()
    } else if (Object.keys(sourceFlatTranslations).length) {
      const merged = {
        ...sourceFlatTranslations,
        ...allEdits,
      }

      setFormattedTranslations(normalizeDataShape(merged))
    }
  }, [sourceFlatTranslations])

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

  const getMergedFlatTranslations = () => ({
    ...sourceFlatTranslations,
    ...allEdits,
  })

  const downloadTargetJson = () => {
    const unflattenedTranslations = unflattenObject(getMergedFlatTranslations())
    exportFromJSON({
      data: unflattenedTranslations,
      fileName: `translations-${Date.now()}`,
      exportType: 'json',
    })
  }

  return (
    <EditsContext.Provider
      value={{
        numberOfEdits,
        allEdits,
        setEdit,
        formattedTranslations,
        addSourceFile,
        namespacesWithRealDiff,
        downloadTargetJson,
      }}
    >
      {children}
    </EditsContext.Provider>
  )
}

export const useEdits = (): EditsContextType => useContext(EditsContext)
