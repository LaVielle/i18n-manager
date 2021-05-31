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
  sourceFlatTranslations: { [key: string]: string }
  keysWithRealDiff: { [key: string]: boolean }
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

    // This commented out logic can be used to add a new language, in this case: French (fr).
    // It loops through all the keys and creates a key for the new language, with an empty string as the value.
    // If the key already exists, it is ignored.
    // const srcWithFrench = Object.keys(flatSource).reduce(
    //   (acc, k) => {
    //     const { namespace, key } = getDataFromFlatKeyId(k)
    //
    //     const newKey = `fr.${namespace}.${key}`
    //
    //     if (!acc[newKey]) {
    //       return {
    //         ...acc,
    //         [newKey]: '',
    //       }
    //     }
    //
    //     return acc
    //   },
    //   { ...flatSource }
    // )

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
    setAllEdits((prevAllEdits: any) => ({
      ...prevAllEdits,
      [key]: value,
    }))
  }

  useEffect(() => {
    const newKeysWithRealDiff = {}
    Object.keys(allEdits).forEach((key) => {
      if (allEdits[key] !== sourceFlatTranslations[key]) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
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

  const downloadTargetJson = () =>
    new Promise<void>((resolve) => {
      const unflattenedTranslations = unflattenObject(getMergedFlatTranslations())
      exportFromJSON({
        data: unflattenedTranslations,
        fileName: `translations-${Date.now()}`,
        exportType: 'json',
      })
      resolve()
    })

  return (
    <EditsContext.Provider
      value={{
        numberOfEdits,
        allEdits,
        setEdit,
        sourceFlatTranslations,
        formattedTranslations,
        addSourceFile,
        keysWithRealDiff,
        namespacesWithRealDiff,
        downloadTargetJson,
      }}
    >
      {children}
    </EditsContext.Provider>
  )
}

export const useEdits = (): EditsContextType => useContext(EditsContext)
