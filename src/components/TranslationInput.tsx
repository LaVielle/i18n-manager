import React from 'react'

import { useEdits } from '../context/Edits'
import { useDebounce } from '../utils/debounce'

type Props = {
  translationId: string
  language: string
  translation: string
}

export const TranslationInput: React.FC<Props> = ({ translationId, language, translation }) => {
  const { setEdit, keysWithRealDiff, sourceFlatTranslations } = useEdits()

  const keyHasRealDiff = !!keysWithRealDiff[translationId]

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
          className={`flex-1 border-2 p-4 rounded-md ${
            keyHasRealDiff ? 'border-green-400' : 'border-gray-300'
          }`}
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
