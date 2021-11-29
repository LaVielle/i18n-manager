import exportFromJSON from 'export-from-json'
import { useRouter } from 'next/router'
import React, { useContext, useEffect, useState } from 'react'

import {
  flattenObject,
  getDataFromFlatKeyId,
  NormalizedObject,
  SourceDataObject,
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
  addSourceFile: (translations: SourceDataObject) => void
  downloadTargetJson: () => void
}

const EditsContext = React.createContext<EditsContextType>({} as EditsContextType)

export const EditsContextProvider: React.FC = ({ children }) => {
  const router = useRouter()

  const [numberOfEdits, setNumberOfEdits] = useState(0)

  // state to hold the original translation file, as it was before edits
  const [sourceFlatTranslations, setSourceFlatTranslations] = useLocalStorage<
    Record<string, unknown>
  >('sourceFlatTranslations', {})

  const [formattedTranslations, setFormattedTranslations] =
    useLocalStorage<NormalizedObject | null>('formattedTranslations', null)

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

    // @ts-ignore
    const keyHasBeenEdited = !!keysWithRealDiff[flatKeyId]

    let isKeyEmpty: boolean

    if (keyHasBeenEdited) {
      // @ts-ignore
      isKeyEmpty = keysWithRealDiff[flatKeyId].trim() === ''
    } else {
      isKeyEmpty = sourceFlatTranslations[flatKeyId].trim() === ''
    }

    // @ts-ignore
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

  const addSourceFile = (translations: SourceDataObject) => {
    if (Object.keys(translations).length === 0) {
      return setSourceFlatTranslations({})
    }

    const mainLanguageFlat = flattenObject({ en: translations.en })

    const translationsCopy = { ...translations }

    delete translationsCopy.en

    const otherLanguagesFlat = flattenObject(translationsCopy)

    const normalizedObject: NormalizedObject = {}

    for (let i = 0; i < Object.keys(mainLanguageFlat).length; i += 1) {
      const currentKey = Object.keys(mainLanguageFlat)[i]
      const { namespace, key } = getDataFromFlatKeyId(currentKey)

      const keyEn = `en.${namespace}.${key}`

      const newKeyDe = `de.${namespace}.${key}`
      const newKeyNl = `nl.${namespace}.${key}`
      const newKeyFr = `fr.${namespace}.${key}`
      const newKeyNo = `no.${namespace}.${key}`

      if (!otherLanguagesFlat[newKeyDe]) {
        otherLanguagesFlat[newKeyDe] = ''
      }

      if (!otherLanguagesFlat[newKeyNl]) {
        otherLanguagesFlat[newKeyNl] = ''
      }

      if (!otherLanguagesFlat[newKeyFr]) {
        otherLanguagesFlat[newKeyFr] = ''
      }

      if (!otherLanguagesFlat[newKeyNo]) {
        otherLanguagesFlat[newKeyNo] = ''
      }

      if (normalizedObject[namespace]) {
        normalizedObject[namespace][key] = {
          de: otherLanguagesFlat[newKeyDe],
          en: mainLanguageFlat[keyEn],
          fr: otherLanguagesFlat[newKeyFr],
          nl: otherLanguagesFlat[newKeyNl],
          no: otherLanguagesFlat[newKeyNo],
        }
      } else {
        normalizedObject[namespace] = {
          [key]: {
            de: otherLanguagesFlat[newKeyDe],
            en: mainLanguageFlat[keyEn],
            fr: otherLanguagesFlat[newKeyFr],
            nl: otherLanguagesFlat[newKeyNl],
            no: otherLanguagesFlat[newKeyNo],
          },
        }
      }
    }

    const output = {
      ...mainLanguageFlat,
      ...otherLanguagesFlat,
    }

    setSourceFlatTranslations(output)
    setFormattedTranslations(normalizedObject)

    // setSourceFlatTranslations(flatSource)
  }

  useEffect(() => {
    // Navigate to the start page if there is no source file yet
    if (!Object.keys(sourceFlatTranslations).length && router.pathname !== '/start') {
      router.push('start').then()
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
