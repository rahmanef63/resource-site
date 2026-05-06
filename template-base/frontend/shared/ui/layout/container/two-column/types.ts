/**
 * Two Column Layout Types
 */

import type { ReactNode } from "react"

export interface TwoColumnLayoutProps {
  /** Main content area */
  main: ReactNode
  /** Sidebar content area */
  sidebar: ReactNode
  /** Sidebar position (default: "left") */
  sidebarPosition?: "left" | "right"
  /** Additional class names */
  className?: string
  
  // Sizing
  /** Sidebar default width */
  sidebarWidth?: number
  /** Sidebar minimum width */
  minSidebarWidth?: number
  /** Sidebar maximum width */
  maxSidebarWidth?: number
  /** Main content minimum width */
  mainMinWidth?: number
  
  // Behavior
  /** Whether the sidebar is collapsible */
  collapsible?: boolean
  /** Default collapsed state */
  defaultCollapsed?: boolean
  /** Whether to persist state */
  persistState?: boolean
  /** Storage key for persistence */
  storageKey?: string
  
  // Responsive
  /** Breakpoint to collapse sidebar */
  collapseAt?: number
  /** Breakpoint to stack layout (mobile) */
  stackAt?: number
}

export interface TwoColumnContextValue {
  sidebarCollapsed: boolean
  setSidebarCollapsed: (collapsed: boolean) => void
  sidebarWidth: number
  setSidebarWidth: (width: number) => void
  isStacked: boolean
  isMobile: boolean
  sidebarPosition: "left" | "right"
}
