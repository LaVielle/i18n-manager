import React from 'react'

import translations from '../data.json'
import { flattenObject } from '../utils/flattenObject'

const normalizeDataShape = (flatObject: any) => {
  return Object.keys(flatObject).reduce((acc, cur, index) => {
    const [language, namespace, key] = cur.split('.')

    if (acc[namespace]) {
      if (acc[namespace][key]) {
        acc[namespace][key] = {
          ...acc[namespace][key],
          [language]: Object.values(flatObject)[index],
        }
      } else {
        acc[namespace] = {
          ...acc[namespace],
          [key]: {
            [language]: Object.values(flatObject)[index],
          },
        }
      }
    } else {
      acc = {
        ...acc,
        [namespace]: {
          [key]: {
            [language]: Object.values(flatObject)[index],
          },
        },
      }
    }

    return acc
  }, {})
}

const renderNamespaceHeader = () => {}

const renderKeyHeader = () => {}

const renderKeyAndStrings = () => {}

export default function Index() {
  const flatTranslations = flattenObject(translations)
  const formatted = normalizeDataShape(flatTranslations)

  return (
    <div className="flex flex-row">
      <div className="h-screen w-56 bg-blue-500 p-8 overflow-scroll">
        {Object.keys(formatted).map((namespace) => (
          <h1 key={`nameSpaceSidebar-${namespace}`}>{namespace}</h1>
        ))}
      </div>
      <div className="flex flex-1 flex-col h-screen overflow-scroll p-8">
        {Object.keys(formatted).map((namespace, indexInNamespaces) => {
          const keysOfNamespace = Object.values(formatted)[indexInNamespaces]

          return (
            <section className="pb-16 border-b-2 border-black mb-16">
              <h2 className="text-4xl">{namespace}</h2>

              {Object.keys(keysOfNamespace).map((key, indexInKeys) => {
                const languagesOfKey = Object.values(keysOfNamespace)[indexInKeys]

                return (
                  <div className="mt-4">
                    <h3 className="text-2xl">{key}</h3>

                    {Object.keys(languagesOfKey).map((language, indexInLanguages) => {
                      const translation = Object.values(languagesOfKey)[indexInLanguages]

                      return (
                        <div className="flex items-center mt-4">
                          <p className="mr-4 text-xl text-gray-700">{language}</p>
                          <input
                            className="flex-1 border-2 p-4 rounded-md border-gray-300"
                            defaultValue={translation}
                            onChange={(e) => console.log('onChange', e.target.value)}
                          />
                        </div>
                      )
                    })}
                  </div>
                )
              })}
            </section>
          )
        })}
      </div>
    </div>
  )
}
