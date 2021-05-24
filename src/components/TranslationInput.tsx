import React from 'react'

import { useEdits } from '../context/Edits'
import { useDebounce } from '../utils/debounce'

type Props = {
  translationId: string
  language: string
  translation: string
}

export const TranslationInput: React.FC<Props> = ({ translationId, language, translation }) => {
  const { setEdit } = useEdits()

  const onChange = useDebounce(
    (e) => {
      setEdit(translationId, e.target.value)
    },
    350,
    [setEdit]
  )

  return (
    <>
      <p className="w-12 text-xl text-gray-700">{language}</p>
      <input
        className="flex-1 border-2 p-4 rounded-md border-gray-300"
        defaultValue={translation}
        onChange={onChange}
      />
    </>
  )
}
