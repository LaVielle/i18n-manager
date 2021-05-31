import React from 'react'

// import { ActionButton } from './ActionButton'

type Props = {
  label: string
}

export const StickyNamespaceHeader: React.FC<Props> = ({ label }) => (
  <div className="sticky top-0 py-4 px-8 mb-8 bg-white bg-opacity-95 shadow-md flex items-center">
    <h2 className="text-4xl flex-1">{label}</h2>

    {/* TODO: button to add a new key to the current namespace */}
    {/*<ActionButton label="Add new key" onClick={() => console.log('Add new key')} />*/}
  </div>
)
