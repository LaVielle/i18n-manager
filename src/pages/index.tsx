import React, { useRef } from 'react'

import { KeyValueInput } from '../components/KeyValueInput'
// import translations from '../data.json'
import translations from '../data-long.json'
import { flattenObject } from '../utils/flattenObject'

const normalizeDataShape = (flatObject: { [key: string]: string }) => {
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

  const sectionRefs = useRef<{ [key: string]: HTMLElement | null }>({}).current

  const scrollToNamespaceSection = (namespace: string) => {
    const sectionId = `namespaceSection-${namespace}`

    const sectionRef = sectionRefs[sectionId]
    if (sectionRef) {
      sectionRef.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <div className="flex flex-row">
      <div className="h-screen w-56 bg-gray-800 py-8 px-4 overflow-scroll space-y-2">
        {Object.keys(formatted).map((namespace) => (
          <button
            key={`nameSpaceSidebar-${namespace}`}
            onClick={() => scrollToNamespaceSection(namespace)}
            className="px-4 py-1 rounded-md block hover:bg-gray-600"
          >
            <h1 className="text-gray-100 text-xl">{namespace}</h1>
          </button>
        ))}
      </div>

      <div className="flex flex-1 flex-col h-screen overflow-scroll pb-8">
        {Object.keys(formatted).map((namespace, indexInNamespaces) => {
          const keysOfNamespace = Object.values(formatted)[indexInNamespaces]

          const sectionId = `namespaceSection-${namespace}`

          return (
            <section
              id={sectionId}
              key={sectionId}
              className="pb-16 border-b-2 border-gray-300 mb-16"
              ref={(r) => (sectionRefs[sectionId] = r)}
            >
              <h2 className="text-4xl sticky top-0 py-4 px-8 mb-2 bg-white bg-opacity-95 shadow-md">
                {namespace}
              </h2>

              <div className="space-y-8 px-8">
                {Object.keys(keysOfNamespace).map((key, indexInKeys) => {
                  const languagesOfKey = Object.values(keysOfNamespace)[indexInKeys]

                  return (
                    <div
                      key={`namespaceKeySection-${namespace}-${key}`}
                      className="p-4 bg-gray-200 rounded-lg shadow-sm"
                    >
                      <h3 className="text-2xl text-gray-900">{key}</h3>

                      {Object.keys(languagesOfKey).map((language, indexInLanguages) => {
                        const translation = Object.values(languagesOfKey)[indexInLanguages]

                        return (
                          <div
                            key={`namespaceKeyLanguageSection-${namespace}-${key}-${language}-`}
                            className="flex items-center mt-4"
                          >
                            <KeyValueInput
                              keyId={`${language}.${namespace}.${key}`}
                              language={language}
                              translation={translation}
                            />
                          </div>
                        )
                      })}
                    </div>
                  )
                })}
              </div>
            </section>
          )
        })}
      </div>
    </div>
  )
}
