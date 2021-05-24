import React, { useRef } from 'react'

import { EditsSummaryFooter } from '../components/EditsSummaryFooter'
import { StickyNamespaceHeader } from '../components/StickyNamespaceHeader'
import { TranslationBox } from '../components/TranslationBox'
import { useEdits } from '../context/Edits'
// import translations from '../data.json'

export default function Index() {
  const { formattedTranslations } = useEdits()

  const sectionRefs = useRef<{ [key: string]: HTMLElement | null }>({}).current

  const scrollToNamespaceSection = (namespace: string) => {
    const sectionId = `namespaceSection-${namespace}`

    const sectionRef = sectionRefs[sectionId]
    if (sectionRef) {
      sectionRef.scrollIntoView({ behavior: 'smooth' })
    }
  }

  if (!formattedTranslations) {
    return <h1>Loading...</h1>
  }

  return (
    <div className="flex">
      <div className="h-screen w-56 bg-gray-800 py-8 px-4 overflow-scroll space-y-2">
        {Object.keys(formattedTranslations).map((namespace) => (
          <button
            key={`nameSpaceSidebar-${namespace}`}
            onClick={() => scrollToNamespaceSection(namespace)}
            className="px-4 py-1 rounded-md block hover:bg-gray-600"
          >
            <h1 className="text-gray-100 text-xl">{namespace}</h1>
          </button>
        ))}
      </div>

      <div className="flex flex-1 flex-col h-screen overflow-scroll">
        <>
          {Object.keys(formattedTranslations).map((namespace, indexInNamespaces) => {
            const keysOfNamespace = Object.values(formattedTranslations)[indexInNamespaces]

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
                        translations={formattedTranslations[namespace][key]}
                      />
                    )
                  })}
                </div>
              </section>
            )
          })}
          <EditsSummaryFooter />
        </>
      </div>
    </div>
  )
}
