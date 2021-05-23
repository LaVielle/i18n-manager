import { useState } from 'react'

import { useDebounce } from './debounce'

/**
 * useLocalStorage
 *
 * A hook that syncs state to local storage so it can be persisted accross sessions.
 * Taken from and only slightly modified: https://usehooks.com/useLocalStorage/
 * */

type UseLocalStorage = [storedValue: any, setValue: (value: any) => void]

export const useLocalStorage = (
  key: string,
  initialValue: Record<string, unknown>
): UseLocalStorage => {
  const debounceSaveToLocalStorage = useDebounce((k, v) => {
    window.localStorage.setItem(k, v)
  }, 500)

  // State to store our value
  // Pass initial state function to useState so logic is only executed once
  const [storedValue, setStoredValue] = useState(() => {
    try {
      // Get from local storage by key
      const item = window.localStorage.getItem(key)

      // Parse stored json or if none return initialValue
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      // If error also return initialValue
      console.log(error)
      return initialValue
    }
  })

  // Return a wrapped version of useState's setter function that ...
  // ... persists the new value to localStorage.
  const setValue = (value: any) => {
    try {
      // Allow value to be a function so we have same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value

      // Save state
      setStoredValue(() => valueToStore)

      debounceSaveToLocalStorage(key, JSON.stringify(valueToStore))
    } catch (error) {
      // A more advanced implementation would handle the error case
      console.log(error)
    }
  }
  return [storedValue, setValue]
}
