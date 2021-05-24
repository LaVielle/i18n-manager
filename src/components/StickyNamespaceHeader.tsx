import React from 'react'

type Props = {
  label: string
}

export const StickyNamespaceHeader: React.FC<Props> = ({ label }) => (
  <div className="sticky top-0 py-4 px-8 mb-2 bg-white bg-opacity-95 shadow-md flex items-center">
    <h2 className="text-4xl flex-1">{label}</h2>

    {/* TODO: button to add a new key to the current namespace */}
    {/*<button className="bg-green-500 hover:bg-green-400 px-4 py-2 rounded-md text-xl text-white">*/}
    {/*  Add new key*/}
    {/*</button>*/}
  </div>
)
