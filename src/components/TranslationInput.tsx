import React from 'react'

import { useEdits } from '../context/Edits'
import { getDataFromFlatKeyId, getFlatKeyId } from '../utils/dataTransformers'
import { useDebounce } from '../utils/debounce'

type Props = {
  translationId: string
  language: string
  translation: string
}

export const TranslationInput: React.FC<Props> = ({ translationId, language, translation }) => {
  const { setEdit, keysWithRealDiff, emptyKeys, sourceFlatTranslations, mainLanguage } = useEdits()

  const { namespace, key } = getDataFromFlatKeyId(translationId)

  const keyIsEmpty = !!emptyKeys[namespace][translationId]
  const keyHasRealDiff = !!keysWithRealDiff[translationId]
  const keyValue = keyHasRealDiff
    ? keysWithRealDiff[translationId]
    : sourceFlatTranslations[translationId]

  const isMainLanguage = language === mainLanguage
  let isSameAsMainLanguage = false

  if (!isMainLanguage) {
    const mainLanguageId = getFlatKeyId({ language: mainLanguage, namespace, key })
    const mainLanguageHadRealDiff = !!keysWithRealDiff[mainLanguageId]
    const mainLanguageKeyValue = mainLanguageHadRealDiff
      ? keysWithRealDiff[mainLanguageId]
      : sourceFlatTranslations[mainLanguageId]

    isSameAsMainLanguage = !isMainLanguage && keyValue === mainLanguageKeyValue
  }

  let borderColorClass = 'border-gray-300'
  if (keyIsEmpty) {
    borderColorClass = 'border-red-400'
  } else if (keyHasRealDiff) {
    borderColorClass = 'border-green-400'
  }

  const onChange = useDebounce(
    (e) => {
      setEdit(translationId, e.target.value)
    },
    350,
    [setEdit]
  )

  return (
    <>
      <p className="w-12 pt-3.5 text-xl text-gray-700">{language}</p>
      <div className={'flex flex-col flex-1'}>
        <input
          className={`flex-1 border-2 p-4 rounded-md ${borderColorClass}`}
          defaultValue={translation}
          onChange={onChange}
        />
        {keyHasRealDiff && (
          <p className="text-green-400 pt-1">
            Changed from: {sourceFlatTranslations[translationId]}
          </p>
        )}
        {isSameAsMainLanguage && (
          <p className="text-yellow-500 pt-1">Warning: Same as main language</p>
        )}
      </div>
    </>
  )
}
