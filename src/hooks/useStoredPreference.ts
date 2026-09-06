'use client'

import { useCallback, useSyncExternalStore } from 'react'

/**
 * A single string preference kept in `localStorage`, read the way React reads
 * any external store. On the server — and on the very first client render, so
 * that hydration matches — the snapshot is `null`; React then re-renders with
 * the stored value.
 */

const listeners = new Set<() => void>()

const subscribe = (listener: () => void) => {
  listeners.add(listener)
  // `storage` fires in the *other* tabs, so a preference changed in one tab
  // follows the user into the ones already open.
  window.addEventListener('storage', listener)
  return () => {
    listeners.delete(listener)
    window.removeEventListener('storage', listener)
  }
}

export function useStoredPreference(key: string): [string | null, (value: string) => void] {
  const value = useSyncExternalStore(
    subscribe,
    () => localStorage.getItem(key),
    () => null
  )

  const setValue = useCallback(
    (next: string) => {
      localStorage.setItem(key, next)
      // `storage` does not fire in the tab that wrote, so tell it directly.
      listeners.forEach(listener => listener())
    },
    [key]
  )

  return [value, setValue]
}
