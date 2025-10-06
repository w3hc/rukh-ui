/**
 * Theme Context Provider for light/dark mode
 */

'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

type ThemeMode = 'light' | 'dark'

type ThemeContextType = {
  mode: ThemeMode
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType>({
  mode: 'light',
  toggleTheme: () => {},
})

export const useTheme = () => useContext(ThemeContext)

type ThemeProviderProps = {
  children: ReactNode
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [mode, setMode] = useState<ThemeMode>('light')

  useEffect(() => {
    const storedMode = localStorage.getItem('themeMode') as ThemeMode | null
    if (storedMode && (storedMode === 'light' || storedMode === 'dark')) {
      setMode(storedMode)
    }
  }, [])

  const toggleTheme = () => {
    const newMode = mode === 'dark' ? 'light' : 'dark'
    setMode(newMode)
    localStorage.setItem('themeMode', newMode)
  }

  return <ThemeContext.Provider value={{ mode, toggleTheme }}>{children}</ThemeContext.Provider>
}
