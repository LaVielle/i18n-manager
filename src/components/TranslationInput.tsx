import React from 'react'

import { useEdits } from '../context/Edits'

type Props = {
  translationId: string
  language: string
  translation: string
}

export const TranslationInput: React.FC<Props> = ({ translationId, language, translation }) => {
  const { setEdit } = useEdits()
  return (
    <>
      <p className="w-12 text-xl text-gray-700">{language}</p>
      <input
        className="flex-1 border-2 p-4 rounded-md border-gray-300"
        defaultValue={translation}
        onChange={(e) => {
          console.log('onChange', e.target.value)
          setEdit(translationId, e.target.value)
        }}
      />
    </>
  )
}
