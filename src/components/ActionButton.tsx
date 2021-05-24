import React from 'react'

type Props = {
  label: string
  onClick: () => void
  className?: string
}

export const ActionButton: React.FC<Props> = ({ label, onClick, className }) => (
  <button
    className={`bg-green-500 hover:bg-green-400 text-xl text-white px-4 py-2 rounded-md shadow-md ${className}`}
    onClick={onClick}
  >
    {label}
  </button>
)
