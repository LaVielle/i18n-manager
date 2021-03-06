import { useState } from 'react'

import { useDebounce } from './debounce'

/**
 * useLocalStorage
 *
 * A hook that syncs state to local storage so it can be persisted across sessions.
 * Taken from and only slightly modified: https://usehooks.com/useLocalStorage/
 * */

type UseLocalStorage<K> = [storedValue: any, setValue: (value: K) => void]

type UseLocalStorageOptions = {
  debounceDuration?: number
  onSaveSuccess?: (key: string, value: string) => void
}

export const useLocalStorage = <K>(
  key: string,
  initialValue: K,
  options?: UseLocalStorageOptions
): UseLocalStorage<K> => {
  const { debounceDuration = 0, onSaveSuccess } = options || {}

  const setItem = (k: string, v: string) => {
    if (typeof window !== undefined) {
      window.localStorage.setItem(k, v)
      if (onSaveSuccess) {
        onSaveSuccess(k, v)
      }
    }
  }

  const debounceSetItem = useDebounce(setItem, debounceDuration)

  // State to store our value
  // Pass initial state function to useState so logic is only executed once
  const [storedValue, setStoredValue] = useState<K>(() => {
    try {
      if (typeof window === undefined) {
        throw new Error('window is undefined')
      } else {
        // Get from local storage by key
        const item = window.localStorage.getItem(key)

        // Parse stored json or if none return initialValue
        return item ? JSON.parse(item) : initialValue
      }
    } catch (error) {
      // If error also return initialValue
      console.log(error)
      return initialValue
    }
  })

  // Return a wrapped version of useState's setter function that ...
  // ... persists the new value to localStorage.
  const setValue = (value: K) => {
    try {
      // Allow value to be a function so we have same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value

      // Save state
      setStoredValue(() => valueToStore)

      debounceSetItem(key, JSON.stringify(valueToStore))

      // if (debounceDuration) {
      //   // Only use the debounced version of setItem if debounceDuration is greater than 0,
      //   // otherwise leads to some weird behavior...
      //   debounceSetItem(key, JSON.stringify(valueToStore))
      // } else {
      //   setItem(key, JSON.stringify(valueToStore))
      // }
    } catch (error) {
      // A more advanced implementation would handle the error case
      console.log(error)
    }
  }
  return [storedValue, setValue]
}
