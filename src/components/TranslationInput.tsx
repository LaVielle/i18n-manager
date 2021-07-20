import React from 'react'

import { useEdits } from '../context/Edits'
import { getDataFromFlatKeyId } from '../utils/dataTransformers'
import { useDebounce } from '../utils/debounce'

type Props = {
  translationId: string
  language: string
  translation: string
}

export const TranslationInput: React.FC<Props> = ({ translationId, language, translation }) => {
  const { setEdit, keysWithRealDiff, emptyKeys, sourceFlatTranslations } = useEdits()

  const { namespace } = getDataFromFlatKeyId(translationId)

  const keyIsEmpty = !!emptyKeys[namespace][translationId]
  const keyHasRealDiff = !!keysWithRealDiff[translationId]

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
          <p className="text-red-300 pt-1">Changed from: {sourceFlatTranslations[translationId]}</p>
        )}
      </div>
    </>
  )
}
