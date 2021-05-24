import React from 'react'

import { LoadingSpinner } from './LoadingSpinner'

type Props = {
  label: string
  onClick: () => void
  className?: string
  loading?: boolean
  disabled?: boolean
}

export const ActionButton: React.FC<Props> = ({ label, onClick, className, loading, disabled }) => (
  <button
    className={`relative overflow-hidden bg-green-500 hover:bg-green-400 text-xl text-white px-4 py-2 rounded-md shadow-md ${className}`}
    onClick={onClick}
    disabled={loading || disabled}
  >
    {label}
    {loading && (
      <div className="bg-gray-600 bg-opacity-60 absolute flex items-center justify-center inset-0">
        <LoadingSpinner />
      </div>
    )}
  </button>
)
