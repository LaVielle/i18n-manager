import React, { useState } from 'react'

import { useEdits } from '../context/Edits'
import { ActionButton } from './ActionButton'

export const EditsSummaryFooter: React.FC = () => {
  const { numberOfEdits, downloadTargetJson } = useEdits()
  const [exportLoading, setExportLoading] = useState(false)

  const onPressExport = () => {
    setExportLoading(true)
    setTimeout(async () => {
      await downloadTargetJson()
      setExportLoading(false)
    }, 250)
  }

  if (!numberOfEdits) {
    return null
  }

  return (
    <div className="sticky bottom-0 flex items-center py-8 px-8 mt-2 bg-white shadow-top-md">
      <h1 className="text-2xl flex-1">
        You have <span className="font-bold border-b-4 border-green-400 px-1">{numberOfEdits}</span>{' '}
        {numberOfEdits === 1 ? 'edit' : 'edits'} saved locally
      </h1>

      {/*<ActionButton*/}
      {/*  label={'View summary'}*/}
      {/*  onClick={() => console.log('hey')}*/}
      {/*  className="bg-green-500 hover:bg-green-400 mr-4"*/}
      {/*/>*/}

      <ActionButton
        label={'Export JSON'}
        onClick={onPressExport}
        className="bg-blue-500 hover:bg-blue-400"
        loading={exportLoading}
      />
    </div>
  )
}
