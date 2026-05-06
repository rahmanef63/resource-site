/**
 * Header Context
 * 
 * React context for header state management.
 * Provides shared state and configuration across header compound components.
 */

"use client"

import * as React from "react"
import type {
  HeaderVariant,
  HeaderSize,
  HeaderLayout,
  HeaderContextValue,
} from "./types"

// ============================================================================
// Context
// ============================================================================

const HeaderContext = React.createContext<HeaderContextValue | null>(null)
HeaderContext.displayName = "HeaderContext"

// ============================================================================
// Hook
// ============================================================================

/**
 * Hook to access header context
 * @throws Error if used outside of HeaderProvider
 */
export function useHeaderContext(): HeaderContextValue {
  const context = React.useContext(HeaderContext)
  if (!context) {
    throw new Error("useHeaderContext must be used within a HeaderProvider")
  }
  return context
}

/**
 * Safe version that returns null if outside context
 */
export function useHeaderContextSafe(): HeaderContextValue | null {
  return React.useContext(HeaderContext)
}

// ============================================================================
// Provider Props
// ============================================================================

export interface HeaderProviderProps {
  /** Header variant */
  variant?: HeaderVariant
  /** Header size */
  size?: HeaderSize
  /** Header layout */
  layout?: HeaderLayout
  /** Is sticky */
  sticky?: boolean
  /** Has background */
  background?: boolean
  /** Has border */
  border?: boolean
  /** Children */
  children: React.ReactNode
}

// ============================================================================
// Provider
// ============================================================================

export function HeaderProvider({
  variant = "default",
  size = "md",
  layout = "standard",
  sticky = false,
  background = true,
  border = true,
  children,
}: HeaderProviderProps) {
  // Section registry for split layout
  const [sections, setSections] = React.useState<{
    left: React.ReactNode | null
    center: React.ReactNode | null
    right: React.ReactNode | null
  }>({
    left: null,
    center: null,
    right: null,
  })

  // Register a section
  const registerSection = React.useCallback(
    (position: "left" | "center" | "right", element: React.ReactNode) => {
      setSections((prev) => ({
        ...prev,
        [position]: element,
      }))
    },
    []
  )

  // Unregister a section
  const unregisterSection = React.useCallback(
    (position: "left" | "center" | "right") => {
      setSections((prev) => ({
        ...prev,
        [position]: null,
      }))
    },
    []
  )

  const contextValue = React.useMemo<HeaderContextValue>(
    () => ({
      variant,
      size,
      layout,
      isSticky: sticky,
      hasBackground: background,
      hasBorder: border,
      registerSection,
      unregisterSection,
    }),
    [variant, size, layout, sticky, background, border, registerSection, unregisterSection]
  )

  return (
    <HeaderContext.Provider value={contextValue}>
      {children}
    </HeaderContext.Provider>
  )
}

// ============================================================================
// Dynamic Header Context (for runtime updates)
// ============================================================================

export interface DynamicHeaderState {
  /** Current title */
  title?: string
  /** Current subtitle */
  subtitle?: string
  /** Current breadcrumbs */
  breadcrumbs?: Array<{ label: string; href?: string }>
  /** Current actions */
  actions?: React.ReactNode
  /** Custom data */
  data?: Record<string, unknown>
}

export interface DynamicHeaderContextValue {
  /** Current state */
  state: DynamicHeaderState
  /** Update title */
  setTitle: (title: string) => void
  /** Update subtitle */
  setSubtitle: (subtitle: string) => void
  /** Update breadcrumbs */
  setBreadcrumbs: (breadcrumbs: Array<{ label: string; href?: string }>) => void
  /** Update actions */
  setActions: (actions: React.ReactNode) => void
  /** Update custom data */
  setData: (key: string, value: unknown) => void
  /** Reset state */
  reset: () => void
  /** Batch update */
  update: (updates: Partial<DynamicHeaderState>) => void
}

const DynamicHeaderContext = React.createContext<DynamicHeaderContextValue | null>(null)
DynamicHeaderContext.displayName = "DynamicHeaderContext"

/**
 * Hook to access dynamic header context
 */
export function useDynamicHeader(): DynamicHeaderContextValue {
  const context = React.useContext(DynamicHeaderContext)
  if (!context) {
    throw new Error("useDynamicHeader must be used within a DynamicHeaderProvider")
  }
  return context
}

/**
 * Safe version
 */
export function useDynamicHeaderSafe(): DynamicHeaderContextValue | null {
  return React.useContext(DynamicHeaderContext)
}

export interface DynamicHeaderProviderProps {
  /** Initial state */
  initialState?: Partial<DynamicHeaderState>
  /** Children */
  children: React.ReactNode
}

/**
 * Provider for dynamic header updates
 * Allows child components to update header content
 */
export function DynamicHeaderProvider({
  initialState = {},
  children,
}: DynamicHeaderProviderProps) {
  const [state, setState] = React.useState<DynamicHeaderState>(initialState)

  const setTitle = React.useCallback((title: string) => {
    setState((prev) => ({ ...prev, title }))
  }, [])

  const setSubtitle = React.useCallback((subtitle: string) => {
    setState((prev) => ({ ...prev, subtitle }))
  }, [])

  const setBreadcrumbs = React.useCallback(
    (breadcrumbs: Array<{ label: string; href?: string }>) => {
      setState((prev) => ({ ...prev, breadcrumbs }))
    },
    []
  )

  const setActions = React.useCallback((actions: React.ReactNode) => {
    setState((prev) => ({ ...prev, actions }))
  }, [])

  const setData = React.useCallback((key: string, value: unknown) => {
    setState((prev) => ({
      ...prev,
      data: { ...prev.data, [key]: value },
    }))
  }, [])

  const reset = React.useCallback(() => {
    setState(initialState)
  }, [initialState])

  const update = React.useCallback((updates: Partial<DynamicHeaderState>) => {
    setState((prev) => ({ ...prev, ...updates }))
  }, [])

  const contextValue = React.useMemo<DynamicHeaderContextValue>(
    () => ({
      state,
      setTitle,
      setSubtitle,
      setBreadcrumbs,
      setActions,
      setData,
      reset,
      update,
    }),
    [state, setTitle, setSubtitle, setBreadcrumbs, setActions, setData, reset, update]
  )

  return (
    <DynamicHeaderContext.Provider value={contextValue}>
      {children}
    </DynamicHeaderContext.Provider>
  )
}

// ============================================================================
// Helper Hooks
// ============================================================================

/**
 * Hook to set header title from child component
 */
export function useSetHeaderTitle(title: string) {
  const { setTitle } = useDynamicHeader()
  
  React.useEffect(() => {
    setTitle(title)
  }, [title, setTitle])
}

/**
 * Hook to set header breadcrumbs from child component
 */
export function useSetHeaderBreadcrumbs(
  breadcrumbs: Array<{ label: string; href?: string }>
) {
  const { setBreadcrumbs } = useDynamicHeader()
  
  React.useEffect(() => {
    setBreadcrumbs(breadcrumbs)
  }, [breadcrumbs, setBreadcrumbs])
}

/**
 * Hook to set header actions from child component
 */
export function useSetHeaderActions(actions: React.ReactNode) {
  const { setActions } = useDynamicHeader()
  
  React.useEffect(() => {
    setActions(actions)
  }, [actions, setActions])
}
