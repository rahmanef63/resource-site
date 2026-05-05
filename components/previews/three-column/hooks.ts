/**
 * Three Column Layout Hooks
 */

"use client"

import * as React from "react"

/**
 * Persisted state hook with localStorage
 * Uses lazy initialization to avoid hydration mismatches
 */
export function usePersistedState<T>(
  key: string,
  defaultValue: T,
  enabled: boolean
): [T, React.Dispatch<React.SetStateAction<T>>] {
  // Use lazy initialization to read from localStorage only on client
  const [state, setState] = React.useState<T>(() => {
    // Server-side or disabled: return default
    if (typeof window === "undefined" || !enabled) {
      return defaultValue
    }
    
    try {
      const stored = localStorage.getItem(key)
      if (stored) {
        return JSON.parse(stored)
      }
    } catch {
      // Ignore storage errors
    }
    return defaultValue
  })

  // Sync to localStorage when state changes
  const isFirstMount = React.useRef(true)
  React.useEffect(() => {
    // Skip on first mount to avoid writing default value immediately
    if (isFirstMount.current) {
      isFirstMount.current = false
      return
    }
    
    if (!enabled || typeof window === "undefined") return
    
    try {
      localStorage.setItem(key, JSON.stringify(state))
    } catch {
      // Ignore storage errors
    }
  }, [key, state, enabled])

  return [state, setState]
}

/**
 * Responsive collapse hook - simplified version
 * Only returns whether the viewport is below the breakpoint
 */
export function useResponsiveCollapse(collapseAt: number | undefined) {
  // Start with false for SSR, will update immediately on client
  const [shouldCollapse, setShouldCollapse] = React.useState(false)
  const [hasMounted, setHasMounted] = React.useState(false)

  // Use useEffect for hydration-safe initialization
  React.useEffect(() => {
    setHasMounted(true)
    
    if (!collapseAt || typeof window === "undefined") return

    // Check immediately on mount
    const checkWidth = () => {
      const newValue = window.innerWidth < collapseAt
      setShouldCollapse(newValue)
    }
    
    checkWidth()

    // Debounce resize for performance
    let timeoutId: ReturnType<typeof setTimeout> | null = null
    const handleResize = () => {
      if (timeoutId) clearTimeout(timeoutId)
      timeoutId = setTimeout(checkWidth, 50) // Faster response
    }

    window.addEventListener("resize", handleResize)
    return () => {
      window.removeEventListener("resize", handleResize)
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [collapseAt])

  return shouldCollapse
}

/**
 * Stacked layout hook for mobile
 */
export function useStackedLayout(stackAt: number | undefined) {
  // Start with false for SSR, will update immediately on client
  const [isStacked, setIsStacked] = React.useState(false)

  React.useEffect(() => {
    if (!stackAt || typeof window === "undefined") return

    // Check immediately on mount
    const checkWidth = () => {
      setIsStacked(window.innerWidth < stackAt)
    }
    
    checkWidth()

    // Debounce resize for performance
    let timeoutId: ReturnType<typeof setTimeout> | null = null
    const handleResize = () => {
      if (timeoutId) clearTimeout(timeoutId)
      timeoutId = setTimeout(checkWidth, 50) // Faster response
    }

    window.addEventListener("resize", handleResize)
    return () => {
      window.removeEventListener("resize", handleResize)
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [stackAt])

  return isStacked
}

/**
 * Custom hook to get current window width for responsive behavior
 */
export function useWindowWidth() {
  const [width, setWidth] = React.useState(() => {
    if (typeof window === "undefined") return 1024 // Default for SSR
    return window.innerWidth
  })

  React.useEffect(() => {
    if (typeof window === "undefined") return

    let timeoutId: ReturnType<typeof setTimeout> | null = null
    const handleResize = () => {
      if (timeoutId) clearTimeout(timeoutId)
      timeoutId = setTimeout(() => {
        setWidth(window.innerWidth)
      }, 100)
    }

    window.addEventListener("resize", handleResize)
    return () => {
      window.removeEventListener("resize", handleResize)
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [])

  return width
}
