import React, { useRef } from 'react'

import { StickyNamespaceHeader } from '../components/StickyNamespaceHeader'
import { TranslationBox } from '../components/TranslationBox'
// import translations from '../data.json'
import translations from '../data-long.json'
import { flattenObject, normalizeDataShape } from '../utils/dataTransformers'

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
              <StickyNamespaceHeader label={namespace} />

              <div className="space-y-8 px-8">
                {Object.keys(keysOfNamespace).map((key) => {
                  const keyId = `${namespace}.${key}`
                  return (
                    <TranslationBox
                      key={keyId}
                      keyId={keyId}
                      keyLabel={key}
                      translations={formatted[namespace][key]}
                    />
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
