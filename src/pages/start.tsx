import { useRouter } from 'next/router'
import React, { useState } from 'react'
import { useDropzone } from 'react-dropzone'

import { ActionButton } from '../components/ActionButton'
import { useEdits } from '../context/Edits'

export default function StartPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [tempJsonFile, setTempJsonFile] = useState<{ fileName: string; data: string } | null>(null)
  const { addSourceFile } = useEdits()
  const router = useRouter()

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      setError(null)
      const [file] = acceptedFiles

      if (file.type !== 'application/json') {
        return setError('Please only select a valid JSON file')
      }

      const fileReader = new FileReader()
      fileReader.readAsText(file, 'UTF-8')

      fileReader.onload = (evt) => {
        const result = evt.target?.result
        if (result) {
          setTempJsonFile({ fileName: file.name, data: result as string })
        }
      }
    },
  })

  return (
    <div className="h-screen flex flex-col items-center justify-center">
      <h1 className="text-2xl mb-8">Import your translation file to start</h1>

      <div
        {...getRootProps()}
        className="w-1/2 h-72 p-16 border-8 border-gray-200 border-dashed cursor-pointer flex flex-col items-center justify-center mb-8"
      >
        <input {...getInputProps()} accept=".json" />

        <p className="text-center leading-loose text-lg">
          {isDragActive
            ? 'Drop the files here...'
            : 'Drop a JSON file here, or click to select one'}
        </p>
        {tempJsonFile && (
          <p className="mt-8">
            selected:{' '}
            <span className="font-mono bg-gray-200 rounded-md px-2 py-1">
              {tempJsonFile.fileName}
            </span>
          </p>
        )}
      </div>

      {error && <p className="text-red-500 text-lg">{error}</p>}

      {tempJsonFile && (
        <ActionButton
          label={'Start editing'}
          onClick={() => {
            setLoading(true)
            addSourceFile(JSON.parse(tempJsonFile.data))
            router.push('/').then()
          }}
          loading={loading}
        />
      )}
    </div>
  )
}
