"use client"

import { useIsMobile } from "@/hooks/use-mobile"

/**
 * useMobileResponsive - Consolidated mobile/desktop responsive logic
 *
 * Determines which views should be shown based on device type and selection state
 *
 * @param hasSelection - Whether an item is currently selected
 *
 * @example
 * ```tsx
 * const { isMobile, showList, showDetail, layoutMode } = useMobileResponsive(!!selectedId)
 *
 * if (showList) {
 *   return <ListView />
 * }
 * if (showDetail) {
 *   return <DetailView />
 * }
 * ```
 */
export function useMobileResponsive(hasSelection: boolean) {
  const isMobile = useIsMobile()

  return {
    /** Whether the current device is mobile */
    isMobile,
    /** Whether to show the list view */
    showList: !isMobile || !hasSelection,
    /** Whether to show the detail view */
    showDetail: !isMobile || hasSelection,
    /** Layout mode: 'stack' for mobile, 'split' for desktop */
    layoutMode: isMobile ? ("stack" as const) : ("split" as const),
    /** Mobile-specific: should show list (not detail) */
    shouldShowList: isMobile && !hasSelection,
    /** Mobile-specific: should show detail (not list) */
    shouldShowDetail: isMobile && hasSelection,
  }
}
