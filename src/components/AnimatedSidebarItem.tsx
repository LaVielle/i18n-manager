import { Transition } from '@headlessui/react'
import React from 'react'

type Props = {
  label: string
  dotColorClass: string | undefined
  onClick: () => void
}

export const AnimatedSidebarItem: React.FC<Props> = ({ label, onClick, dotColorClass }) => (
  <button
    onClick={onClick}
    className="relative px-4 py-1 rounded-md hover:bg-gray-600 flex items-center"
  >
    <div className="absolute -inset-x-1">
      <Transition show={!!dotColorClass}>
        <Transition.Child
          enter="transition-opacity ease-linear duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="transition-opacity ease-linear duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div
            className={`${dotColorClass} w-2 h-2 rounded-full opacity-0 transition duration-500 ease-in opacity-100`}
          />
        </Transition.Child>
      </Transition>
    </div>

    <h1 className="text-gray-100 text-xl">{label}</h1>
  </button>
)
