/**
 * Mobile Navigation Hook
 * 
 * Stack-based navigation for mobile three-column layout.
 * Provides history management and level transitions.
 */

"use client"

import { useState, useCallback } from "react"
import type { MobileNavigationLevel } from "../types"

export interface UseMobileNavigationReturn {
    /** Current navigation level */
    currentLevel: MobileNavigationLevel
    /** Navigate to a specific level */
    navigateTo: (level: MobileNavigationLevel) => void
    /** Go back one level in history */
    goBack: () => void
    /** Whether back navigation is available */
    canGoBack: boolean
    /** Clear navigation history */
    reset: () => void
}

/**
 * useMobileNavigation Hook
 * 
 * Manages stack-based navigation for mobile layouts.
 * Maintains history for back button functionality.
 * 
 * @param defaultLevel - Initial navigation level (default: "sidebar")
 * @returns Navigation state and controls
 */
export function useMobileNavigation(
    defaultLevel: MobileNavigationLevel = "sidebar"
): UseMobileNavigationReturn {
    const [currentLevel, setCurrentLevel] = useState<MobileNavigationLevel>(defaultLevel)
    const [history, setHistory] = useState<MobileNavigationLevel[]>([defaultLevel])

    const navigateTo = useCallback((level: MobileNavigationLevel) => {
        setHistory(prev => [...prev, level])
        setCurrentLevel(level)
    }, [])

    const goBack = useCallback(() => {
        if (history.length > 1) {
            const newHistory = history.slice(0, -1)
            setHistory(newHistory)
            setCurrentLevel(newHistory[newHistory.length - 1])
        }
    }, [history])

    const reset = useCallback(() => {
        setHistory([defaultLevel])
        setCurrentLevel(defaultLevel)
    }, [defaultLevel])

    return {
        currentLevel,
        navigateTo,
        goBack,
        canGoBack: history.length > 1,
        reset,
    }
}
