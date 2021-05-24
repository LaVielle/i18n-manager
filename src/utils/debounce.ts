/**
 * debounce
 *
 * Taken from here: https://levelup.gitconnected.com/debounce-in-javascript-improve-your-applications-performance-5b01855e086
 * */
import { useCallback } from 'react'

export const debounce = (func: (...args: any[]) => void, wait: number): (() => void) => {
  let timeout: ReturnType<typeof setTimeout>

  return function executedFunction(...args: any[]) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }

    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

// useDebounce returns a function that can accept any number of params of any type
type UseDebounce = (...args: any[]) => void

export const useDebounce = (
  func: (...args: any[]) => void,
  wait: number,
  dependencies: any[] = []
): UseDebounce => {
  return useCallback(debounce(func, wait), dependencies)
}
