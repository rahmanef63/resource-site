/**
 * Layout Container System
 * 
 * Provides standardized layout containers for the application.
 * 
 * - SingleColumnLayout: Simple container with max-width and centering
 * - TwoColumnLayout: Resizable sidebar + main content
 * - ThreeColumnLayout: Complex 3-pane layout (Left, Center, Right)
 * - PageContainer: High-level page wrapper
 */

// Components
export { ResizeHandle } from "./ResizeHandle"
export type { ResizeHandleProps } from "./ResizeHandle"

// Three Column Layout — modular structure in ./three-column/
//
// SSOT: FeatureThreeColumnLayout is the canonical entry for feature pages.
// The raw `ThreeColumnLayoutAdvanced` primitive is intentionally not
// re-exported here — slices using the wrapper get a consistent
// search/sort/filter/inspector contract. The studio canvas widget reaches
// into ./three-column directly because its builder context renders bare
// placeholder panels (a documented escape).
export {
  FeatureThreeColumnLayout,
  useThreeColumnLayout,
  useThreeColumnLayoutSafe,
  LeftPanel,
  CenterPanel,
  RightPanel,
  // Sub-components for custom compositions
  CollapseButton,
  PanelHeader as ThreeColumnPanelHeader,
  CollapsedPanel as ThreeColumnCollapsedPanel,
  // Hooks for custom implementations
  usePersistedState,
  useResponsiveCollapse,
  useStackedLayout,
  useWindowWidth,
  THREE_COLUMN_PRESETS,
  resolveThreeColumnPreset,
} from "./three-column"
export type {
  ThreeColumnContextValue,
  ThreeColumnPresetName,
  ThreeColumnPresetConfig,
} from "./three-column"

// Page Container
export { PageContainer } from "./PageContainer"
export type { PageContainerProps } from "./PageContainer"

// Column Layout System - For header/main/footer structure in each column
export {
  ColumnLayout,
  ColumnHeader,
  ColumnMain,
  ColumnFooter,
  LeftPanelLayout,
  CenterPanelLayout,
  RightPanelLayout,
  PanelRoot,
  PanelHeader,
  PanelBody,
  PanelFooter,
} from "./column-layout"
export type {
  ColumnLayoutProps,
  ColumnHeaderProps,
  ColumnMainProps,
  ColumnFooterProps,
} from "./column-layout"

// Two Column Layout
export {
  TwoColumnLayout,
  useTwoColumnLayout,
  useTwoColumnLayoutSafe,
} from "./two-column"
export type {
  TwoColumnLayoutProps,
  TwoColumnContextValue,
} from "./two-column"

// Single Column Layout
export {
  SingleColumnLayout,
} from "./single-column"
export type {
  SingleColumnLayoutProps,
} from "./single-column"

// Split View Layout
export {
  SplitView,
  useSplitView,
} from "./split-view"
export type {
  SplitViewPane,
  SplitViewProps,
  SplitViewPaneHeaderProps,
  UseSplitViewReturn,
} from "./split-view"
