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
  emptyKeys: {
    // namespace
    [key: string]: {
      // keyId
      [key: string]: boolean
      // helper key indicating whether the namespace has any empty key
      hasEmptyKeys: boolean
    }
  }
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

  const emptyKeys = Object.keys(sourceFlatTranslations).reduce((acc, flatKeyId) => {
    const { namespace } = getDataFromFlatKeyId(flatKeyId)

    const keyHasBeenEdited = !!keysWithRealDiff[flatKeyId]

    let isKeyEmpty: boolean

    if (keyHasBeenEdited) {
      isKeyEmpty = keysWithRealDiff[flatKeyId].trim() === ''
    } else {
      isKeyEmpty = sourceFlatTranslations[flatKeyId].trim() === ''
    }

    const prevNamespaceValue = acc[namespace] || {}
    return {
      ...acc,
      [namespace]: {
        ...prevNamespaceValue,
        [flatKeyId]: isKeyEmpty,
        hasEmptyKeys: isKeyEmpty ? true : prevNamespaceValue.hasEmptyKeys,
      },
    }
  }, {})

  const addSourceFile = (translations: string) => {
    const flatSource = flattenObject(translations)

    // This loops through all the source keys. If a key is missing for a given language, it creates a key (empty string) for that language.
    // If the key already exists, it is ignored.
    // This assumes the main language is `en`, and that we wanna create keys for `de`, `fr`, and `nl`.
    const srcWithAddedMissingKeys = Object.keys(flatSource).reduce(
      (acc, k) => {
        const { namespace, key } = getDataFromFlatKeyId(k)

        const allKeys = { ...acc }

        const newKeyDe = `de.${namespace}.${key}`
        const newKeyNl = `nl.${namespace}.${key}`
        const newKeyFr = `fr.${namespace}.${key}`

        if (!allKeys[newKeyDe]) {
          allKeys[newKeyDe] = ''
        }
        if (!allKeys[newKeyNl]) {
          allKeys[newKeyNl] = ''
        }
        if (!allKeys[newKeyFr]) {
          allKeys[newKeyFr] = ''
        }

        return allKeys
      },
      { ...flatSource }
    )
    setSourceFlatTranslations(srcWithAddedMissingKeys)

    // setSourceFlatTranslations(flatSource)
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
        emptyKeys,
        downloadTargetJson,
      }}
    >
      {children}
    </EditsContext.Provider>
  )
}

export const useEdits = (): EditsContextType => useContext(EditsContext)
