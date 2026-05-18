/**
 * Three-Column Layout slice — facade over
 * `frontend/shared/ui/layout/container/three-column/`.
 *
 * Re-exports the layout shell + PanelSection compound + primitives so
 * consumers can `import { ThreeColumnLayoutAdvanced, PanelSection, … }
 * from "@/features/three-column"`.
 *
 * See docs/architecture/three-column-layout.md for the trigger ≠ header
 * separation rule and theme tokens.
 */

export {
  ThreeColumnLayoutAdvanced,
  FeatureThreeColumnLayout,
  LeftPanel,
  CenterPanel,
  RightPanel,
  CollapseButton,
  PanelHeader,
  CollapsedPanel,
  PanelSection,
  PanelLeftHeader,
  PanelLeftItems,
  PanelLeftFooter,
  PanelCenterHeader,
  PanelCenterItems,
  PanelCenterFooter,
  PanelRightHeader,
  PanelRightItems,
  PanelRightFooter,
  PanelGroup,
  PanelGroupLabel,
  PanelGroupContent,
  PanelMenu,
  PanelMenuItem,
  PanelMenuButton,
  PanelSeparator,
  ThreeColumnContext,
  useThreeColumnLayout,
  useThreeColumnLayoutSafe,
  usePersistedState,
  useResponsiveCollapse,
  useStackedLayout,
  useWindowWidth,
  THREE_COLUMN_PRESETS,
  resolveThreeColumnPreset,
  MobileHeader,
  useMobileNavigation,
  MobilePanelWrapper,
  MobileInspectorDrawer,
  EmptyState,
  RightPanelTabs,
} from "@/frontend/shared/ui/layout/container/three-column";

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
  UseMobileNavigationReturn,
  MobilePanelWrapperProps,
  MobileInspectorDrawerProps,
  RightPanelMode,
  RightPanelConfig,
  EmptyStateConfig,
  LoadingStateConfig,
  AIActionConfig,
  SettingsActionConfig,
  HeaderActionsConfig,
  EmptyStateProps,
  RightPanelTabsProps,
} from "@/frontend/shared/ui/layout/container/three-column";
