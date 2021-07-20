import React, { useRef } from 'react'

import { AnimatedSidebarItem } from '../components/AnimatedSidebarItem'
import { EditsSummaryFooter } from '../components/EditsSummaryFooter'
import { StickyNamespaceHeader } from '../components/StickyNamespaceHeader'
import { TranslationBox } from '../components/TranslationBox'
import { useEdits } from '../context/Edits'

export default function Index() {
  const { formattedTranslations, namespacesWithRealDiff, emptyKeys } = useEdits()

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
        {Object.keys(formattedTranslations).map((namespace) => {
          const namespaceHasEmptyKeys = emptyKeys[namespace].hasEmptyKeys
          const namespaceHasEdits = !!namespacesWithRealDiff[namespace]

          let dotColorClass = undefined
          if (namespaceHasEmptyKeys) {
            dotColorClass = 'bg-red-500'
          } else if (namespaceHasEdits) {
            dotColorClass = 'bg-green-400'
          }

          return (
            <AnimatedSidebarItem
              key={`nameSpaceSidebar-${namespace}`}
              label={namespace}
              dotColorClass={dotColorClass}
              onClick={() => scrollToNamespaceSection(namespace)}
            />
          )
        })}
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
