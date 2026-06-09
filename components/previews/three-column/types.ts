/**
 * Three Column Layout Types
 */

import type { ReactNode } from "react"

// ---------------------------------------------------------------------------
// Presets
// ---------------------------------------------------------------------------

export type ThreeColumnPresetName = "feature" | "store" | "admin" | "ide"

export type ThreeColumnPresetConfig = Partial<
  Omit<
    ThreeColumnLayoutAdvancedProps,
    | "left"
    | "center"
    | "right"
    | "className"
    | "preset"
    | "leftHeader"
    | "centerHeader"
    | "rightHeader"
    | "leftFooter"
    | "centerFooter"
    | "rightFooter"
  >
>

// ---------------------------------------------------------------------------
// Main Props
// ---------------------------------------------------------------------------

export interface ThreeColumnLayoutAdvancedProps {
  /** Left panel content (optional). If null/undefined, left panel is hidden. */
  left?: ReactNode
  /** Center panel content (main content area) */
  center: ReactNode
  /** Right panel content (optional). If null/undefined, right panel is hidden. */
  right?: ReactNode
  /** Additional class names for the container */
  className?: string

  /** Optional preset name or config to reduce duplication */
  preset?: ThreeColumnPresetName | ThreeColumnPresetConfig

  // Panel Configuration
  /** Left panel default width */
  leftWidth?: number
  /** Right panel default width */
  rightWidth?: number
  /** Center panel minimum width (prevents squishing) */
  centerMinWidth?: number
  /** Minimum width for side panels */
  minSideWidth?: number
  /** Maximum width for side panels */
  maxSideWidth?: number
  /** Width when collapsed (applies to both sides unless hidden) */
  collapsedWidth?: number

  // Size Distribution (when viewport is constrained)
  /** How to distribute/allow shrinking: 'center-priority' protects center, 'right-priority' protects right */
  spaceDistribution?: "center-priority" | "right-priority" | "equal"

  // Optional custom headers per panel (rendered when expanded, pinned top via flex-shrink-0)
  leftHeader?: ReactNode
  centerHeader?: ReactNode
  rightHeader?: ReactNode

  // Optional custom footers per panel (pinned bottom via flex-shrink-0, border-top)
  leftFooter?: ReactNode
  centerFooter?: ReactNode
  rightFooter?: ReactNode

  // Collapse / Visibility State
  /** Force-hide left panel entirely (overrides left content) */
  leftHidden?: boolean
  /** Force-hide right panel entirely (overrides right content) */
  rightHidden?: boolean
  /** Whether left panel is collapsed (controlled) */
  leftCollapsed?: boolean
  /** Whether right panel is collapsed (controlled) */
  rightCollapsed?: boolean
  /** Callback when left panel collapse state changes */
  onLeftCollapsedChange?: (collapsed: boolean) => void
  /** Callback when right panel collapse state changes */
  onRightCollapsedChange?: (collapsed: boolean) => void
  /** Default left collapsed state */
  defaultLeftCollapsed?: boolean
  /** Default right collapsed state */
  defaultRightCollapsed?: boolean

  // Features
  /** Enable resizable panels */
  resizable?: boolean
  /** Show collapse buttons (global default) */
  showCollapseButtons?: boolean
  /** Override collapse button visibility for left panel */
  showLeftCollapseButton?: boolean
  /** Override collapse button visibility for right panel */
  showRightCollapseButton?: boolean
  /** Persist collapse state to localStorage */
  persistState?: boolean
  /** Storage key for persisting state */
  storageKey?: string

  // Labels
  /** Left panel label (for accessibility & collapsed indicator) */
  leftLabel?: string
  /** Center panel label */
  centerLabel?: string
  /** Right panel label */
  rightLabel?: string

  // Responsive
  /** Breakpoint to collapse left panel automatically (px). Default: 640 (mobile only) */
  collapseLeftAt?: number
  /** Breakpoint to collapse right panel automatically (px). Default: 1024 (collapses first) */
  collapseRightAt?: number
  /** Breakpoint to stack vertically (px). Default: 480. Set to 0 to disable. */
  stackAt?: number

  // Mobile Navigation (controlled) — only applies when isStacked (mobile mode)
  /** Controlled mobile view: 'left' shows nav panel, 'center' shows main content */
  mobileView?: 'left' | 'center'
  /** Callback when mobile view changes (e.g. user presses Back button) */
  onMobileViewChange?: (view: 'left' | 'center') => void
  /**
   * Custom header for the mobile left panel.
   * - Omitted (default): shows a simple title bar with `leftLabel`
   * - ReactNode: shows this custom header
   * - null: hides the header entirely (use when left content has its own header)
   */
  mobileLeftHeader?: ReactNode

  /**
   * Tone for left/right panel headers + collapsed indicators. "layout" applies
   * a blue accent to mark the top-level (outer) shell. "feature" is the default
   * muted look for nested inner shells. Lets users tell which 3-col they're in.
   */
  tone?: PanelTone
}

export interface ThreeColumnContextValue {
  leftCollapsed: boolean
  rightCollapsed: boolean
  toggleLeft: () => void
  toggleRight: () => void
}

export interface CollapseButtonProps {
  side: "left" | "right"
  collapsed: boolean
  onClick: () => void
  label?: string
}

/**
 * Tone signals which level of nesting a panel belongs to:
 *   "layout"  → outer page shell (DocsShell). Blue accent so user
 *               recognizes it as the top-level chrome.
 *   "feature" → inner / nested 3-col inside a feature page (e.g. /build).
 *               Default muted styling so the inner level reads as secondary.
 */
export type PanelTone = "layout" | "feature"

export interface PanelHeaderProps {
  side: "left" | "right"
  collapsed: boolean
  onToggle: () => void
  label?: string
  showButton: boolean
  tone?: PanelTone
  children?: ReactNode
}

export interface CollapsedPanelProps {
  side: "left" | "right"
  label?: string
  onClick: () => void
  width: number
  tone?: PanelTone
}

export interface PanelProps {
  children: ReactNode
  className?: string
}

// ---------------------------------------------------------------------------
// Mobile Navigation Types
// ---------------------------------------------------------------------------

/** Mobile navigation level for stack-based navigation */
export type MobileNavigationLevel = "sidebar" | "center" | "right"

/** Mobile navigation configuration */
export interface MobileNavigation {
  /** Enable mobile-specific navigation behavior */
  enabled: boolean
  /** Default navigation level to show */
  defaultLevel?: MobileNavigationLevel
  /** Show back button in mobile header */
  showBackButton?: boolean
  /** Enable swipe gesture navigation */
  gestureNavigation?: boolean
}

/** Props for mobile header component */
export interface MobileHeaderProps {
  title: string
  subtitle?: string
  icon?: React.ComponentType<{ className?: string }>
  onBack?: () => void
  actions?: ReactNode
  showBackButton?: boolean
}

// ---------------------------------------------------------------------------
// Right Panel Configuration Types
// ---------------------------------------------------------------------------

/** Available right panel modes */
export type RightPanelMode = "inspector" | "ai" | "notifications" | "settings" | "custom"

/** Right panel configuration */
export interface RightPanelConfig {
  /** Available modes for the right panel */
  modes?: RightPanelMode[]
  /** Default mode when panel opens */
  defaultMode?: RightPanelMode
  /** Show tabs for mode switching */
  tabs?: boolean
  /** Allow panel to be collapsed */
  collapsible?: boolean
}

// ---------------------------------------------------------------------------
// Empty State Types
// ---------------------------------------------------------------------------

/** Empty state configuration */
export interface EmptyStateConfig {
  /** Icon component to display */
  icon?: React.ComponentType<{ className?: string }>
  /** Title text */
  title?: string
  /** Description text */
  description?: string
  /** Optional action button */
  action?: {
    label: string
    onClick: () => void
  }
}

// ---------------------------------------------------------------------------
// Loading State Types
// ---------------------------------------------------------------------------

/** Loading state configuration for panels */
export interface LoadingStateConfig {
  /** Show loading in sidebar */
  sidebar?: boolean
  /** Show loading in center panel */
  center?: boolean
  /** Show loading in right panel */
  right?: boolean
}

// ---------------------------------------------------------------------------
// Header Actions Configuration
// ---------------------------------------------------------------------------

/** AI assistant action configuration */
export interface AIActionConfig {
  /** Enable AI assistant button */
  enabled: boolean
  /** Feature ID for AI context */
  featureId?: string
  /** Context data for AI — consumer-defined payload, narrow before use */
  context?: unknown
}

/** Settings action configuration */
export interface SettingsActionConfig {
  /** Enable settings button */
  enabled: boolean
  /** Settings click handler */
  onClick?: () => void
}

/** Header actions configuration */
export interface HeaderActionsConfig {
  /** AI assistant configuration */
  ai?: AIActionConfig
  /** Settings configuration */
  settings?: SettingsActionConfig
  /** Custom action buttons */
  custom?: ReactNode
}
