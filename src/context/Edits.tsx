import exportFromJSON from 'export-from-json'
import { sort, sortAsync } from 'json-keys-sort'
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
  clearAllTranslationsAndEdits: () => void
  mainLanguage: string
}

const EditsContext = React.createContext<EditsContextType>({} as EditsContextType)

export const EditsContextProvider: React.FC = ({ children }) => {
  const router = useRouter()

  const [numberOfEdits, setNumberOfEdits] = useState(0)

  // state to hold the original translation file, as it was before edits
  const [sourceMetadata, setSourceMetadata] = useLocalStorage<Record<string, unknown>>(
    'sourceMetadata',
    {}
  )

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

  const clearAllTranslationsAndEdits = () => {
    setNumberOfEdits(0)
    setSourceMetadata({})
    setSourceFlatTranslations({})
    setFormattedTranslations(null)
    setAllEdits({})
    setKeysWithRealDiff({})
  }

  const addSourceFile = (translations: SourceDataObject) => {
    if (Object.keys(translations).length === 0) {
      setSourceFlatTranslations({})
      setSourceFlatTranslations({})
      return
    }

    // Save source __metadata to localStorage and then delete it from the object,
    // so that it does not interfere for the flattening code
    // (because __metadata does not have the same lng>ns>key structure).
    setSourceMetadata(translations.__metadata)
    delete translations.__metadata

    const allLanguageCodes = Object.keys(translations)
    const mainLanguageCode = 'en'

    // TODO: finalize this option that allows to control whether to create empty keys if missing for given languages.
    // @ts-ignore
    const disabledLanguageCodes = ['nl']

    const otherLanguageCodes = allLanguageCodes.filter((el) => el !== mainLanguageCode)
    // console.log({ allLanguageCodes, mainLanguageCode, otherLanguageCodes })

    const mainLanguageFlat = flattenObject({ en: translations.en })

    const translationsCopy = { ...translations }

    delete translationsCopy.en

    const otherLanguagesFlat = flattenObject(translationsCopy)

    const normalizedObject: NormalizedObject = {}

    for (let i = 0; i < Object.keys(mainLanguageFlat).length; i += 1) {
      const currentKey = Object.keys(mainLanguageFlat)[i]
      const { namespace, key } = getDataFromFlatKeyId(currentKey)

      const keyEn = `en.${namespace}.${key}`

      for (let j = 0; j < otherLanguageCodes.length; j += 1) {
        const newKeyForLanguageCode = `${otherLanguageCodes[j]}.${namespace}.${key}`

        // create key with and empty string if the key is missing for that language
        if (!otherLanguagesFlat[newKeyForLanguageCode]) {
          otherLanguagesFlat[newKeyForLanguageCode] = ''
        }
      }

      const getValuesForEnabledLanguages = () => {
        const keysForOtherLanguages: { [key: string]: string } = {}

        otherLanguageCodes.forEach((languageCode) => {
          keysForOtherLanguages[languageCode] =
            otherLanguagesFlat[`${languageCode}.${namespace}.${key}`]
        })

        return sort({
          en: mainLanguageFlat[keyEn],
          ...keysForOtherLanguages,
        })
      }

      if (normalizedObject[namespace]) {
        // @ts-ignore
        normalizedObject[namespace][key] = getValuesForEnabledLanguages()
      } else {
        // @ts-ignore
        normalizedObject[namespace] = {
          [key]: getValuesForEnabledLanguages(),
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

  const downloadTargetJson = async () => {
    const unflattenedTranslations = unflattenObject(getMergedFlatTranslations())
    const sorted = await sortAsync(unflattenedTranslations, true)

    exportFromJSON({
      data: {
        ...sourceMetadata,
        ...sorted,
      },
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
        sourceFlatTranslations,
        formattedTranslations,
        addSourceFile,
        keysWithRealDiff,
        namespacesWithRealDiff,
        emptyKeys,
        downloadTargetJson,
        clearAllTranslationsAndEdits,
        mainLanguage: 'en',
      }}
    >
      {children}
    </EditsContext.Provider>
  )
}

export const useEdits = (): EditsContextType => useContext(EditsContext)
