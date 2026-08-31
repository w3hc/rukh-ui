'use client'

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

/**
 * What a page tells the header about itself. Set by the context pages so the
 * header can read "Rukh / <context>" and offer "Edit context" to its creator,
 * instead of each page carrying its own title bar.
 */
export interface PageHeaderState {
  /** Rukh context the current page is about, shown after "Rukh /". */
  contextName: string
  /** Whether the viewer is the context's creator, gating the edit menu item. */
  canEdit: boolean
}

interface PageHeaderApi {
  header: PageHeaderState | null
  setHeader: (header: PageHeaderState | null) => void
}

const PageHeaderContext = createContext<PageHeaderApi | null>(null)

export function PageHeaderProvider({ children }: { children: ReactNode }) {
  const [header, setHeader] = useState<PageHeaderState | null>(null)
  const value = useMemo(() => ({ header, setHeader }), [header])
  return <PageHeaderContext.Provider value={value}>{children}</PageHeaderContext.Provider>
}

/** Read what the current page published; for the header itself. */
export function useHeaderState(): PageHeaderState | null {
  return useContext(PageHeaderContext)?.header ?? null
}

/**
 * Publish this page's context to the header, clearing it on unmount. Pass
 * `null` while the context is still loading or unknown.
 */
export function usePageHeader(contextName: string | null, canEdit = false): void {
  const api = useContext(PageHeaderContext)
  const setHeader = api?.setHeader

  useEffect(() => {
    if (!setHeader) return
    setHeader(contextName ? { contextName, canEdit } : null)
    return () => setHeader(null)
  }, [contextName, canEdit, setHeader])
}
