/**
 * Three Column Layout (Advanced)
 * 
 * Modular three-column layout system with:
 * - Collapsible left and right panels
 * - Resizable panel widths
 * - Responsive breakpoint behavior
 * - Keyboard accessibility (Cmd+B, Cmd+Shift+B)
 * - Smooth animations
 * - Persist collapse state (optional)
 * 
 * @example
 * ```tsx
 * import { ThreeColumnLayoutAdvanced, LeftPanel, CenterPanel, RightPanel } from "./three-column"
 * 
 * <ThreeColumnLayoutAdvanced
 *   left={<Sidebar />}
 *   center={<MainContent />}
 *   right={<Inspector />}
 *   resizable
 *   showCollapseButtons
 *   persistState
 * />
 * ```
 */

// Types
export type {
  ThreeColumnLayoutAdvancedProps,
  ThreeColumnPresetName,
  ThreeColumnPresetConfig,
  ThreeColumnContextValue,
  CollapseButtonProps,
  PanelHeaderProps,
  CollapsedPanelProps,
  PanelProps,
  MobileNavigationLevel,
  MobileNavigation,
  MobileHeaderProps,
  RightPanelMode,
  RightPanelConfig,
  EmptyStateConfig,
  LoadingStateConfig,
  AIActionConfig,
  SettingsActionConfig,
  HeaderActionsConfig,
} from "./types"

// Context
export { ThreeColumnContext, useThreeColumnLayout, useThreeColumnLayoutSafe } from "./context"

// Hooks
export { usePersistedState, useResponsiveCollapse, useStackedLayout, useWindowWidth } from "./hooks"

// Components
export { ThreeColumnLayoutAdvanced } from "./ThreeColumnLayout"
export { FeatureThreeColumnLayout } from "./FeatureThreeColumnLayout"
export { CollapseButton } from "./CollapseButton"
export { PanelHeader } from "./PanelHeader"
export { CollapsedPanel } from "./CollapsedPanel"
export { LeftPanel, CenterPanel, RightPanel } from "./Panels"

// Mobile Components
export { MobileHeader, useMobileNavigation, MobilePanelWrapper, MobileInspectorDrawer } from "./mobile"
export type { UseMobileNavigationReturn, MobilePanelWrapperProps, MobileInspectorDrawerProps } from "./mobile"

// Shared Components
export { EmptyState, RightPanelTabs } from "./components"
export type { EmptyStateProps, RightPanelTabsProps } from "./components"

// Presets
export { THREE_COLUMN_PRESETS, resolveThreeColumnPreset } from "./presets"

