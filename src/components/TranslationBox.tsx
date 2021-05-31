import React from 'react'

import { TranslationInput } from './TranslationInput'

type Props = {
  keyId: string
  keyLabel: string
  translations: { [key: string]: string }
}

export const TranslationBox: React.FC<Props> = ({ keyId, keyLabel, translations }) => (
  <div className="p-4 bg-gray-200 rounded-lg shadow-sm">
    <h3 className="text-2xl text-gray-900">{keyLabel}</h3>

    {Object.keys(translations).map((language, indexInLanguages) => {
      const translation = Object.values(translations)[indexInLanguages]

      return (
        <div key={`namespaceKeyLanguageSection-${keyId}.${language}`} className="flex mt-4">
          <TranslationInput
            translationId={`${language}.${keyId}`}
            language={language}
            translation={translation}
          />
        </div>
      )
    })}
  </div>
)
