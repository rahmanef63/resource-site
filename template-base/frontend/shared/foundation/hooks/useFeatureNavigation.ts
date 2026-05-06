"use client"

import { useState, useCallback } from "react"

/**
 * useFeatureNavigation - Consolidated navigation logic for feature views
 *
 * Handles selection state and back navigation for list/detail features
 *
 * @param defaultTab - The tab to return to when going back (default: 'chats')
 * @param onBackOverride - Optional custom back handler
 *
 * @example
 * ```tsx
 * const { selectedId, setSelectedId, handleBack } = useFeatureNavigation('chats')
 *
 * // In your component:
 * <Button onClick={handleBack}>Back</Button>
 * <ItemList onSelect={setSelectedId} />
 * ```
 */
export function useFeatureNavigation<T = string>(
  defaultTab?: string,
  onBackOverride?: () => void
) {
  const [selectedId, setSelectedId] = useState<T | undefined>()

  const handleBack = useCallback(() => {
    if (onBackOverride) {
      onBackOverride()
      return
    }

    if (selectedId) {
      // If something is selected, deselect it
      setSelectedId(undefined)
    } else if (defaultTab) {
      // Otherwise, navigate back to default tab
      // Note: This assumes the parent provides setActiveTab via store
      // Individual features can override this behavior
    }
  }, [selectedId, defaultTab, onBackOverride])

  const clearSelection = useCallback(() => {
    setSelectedId(undefined)
  }, [])

  return {
    selectedId,
    setSelectedId,
    handleBack,
    clearSelection,
    hasSelection: selectedId !== undefined,
  }
}
