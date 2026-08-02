/**
 * Header System
 * 
 * Unified header components for consistent UI across the application.
 * 
 * Features:
 * - Multiple header variants (feature, sidebar, container, page, modal, card, etc.)
 * - Compound component pattern for flexibility
 * - Pre-configured presets for common use cases
 * - Full TypeScript support
 * - Dynamic header updates via context
 * - Breadcrumbs, search, actions, badges, meta support
 * 
 * @example Feature Header
 * ```tsx
 * import { FeatureHeader } from "@/frontend/shared/ui/layout/header"
 * 
 * <FeatureHeader
 *   title="Documents"
 *   subtitle="Manage your documents"
 *   icon={FileText}
 *   primaryAction={{
 *     label: "Add Document",
 *     icon: Plus,
 *     onClick: handleAdd,
 *   }}
 *   badge={{ text: "Beta", variant: "secondary" }}
 * />
 * ```
 * 
 * @example Compound Pattern
 * ```tsx
 * import { Header } from "@/frontend/shared/ui/layout/header"
 * 
 * <Header variant="default" size="lg">
 *   <Header.Breadcrumbs items={breadcrumbs} />
 *   <Header.Title title="Page Title" subtitle="Description" icon={Icon} />
 *   <Header.Actions>
 *     <Button>Add</Button>
 *   </Header.Actions>
 * </Header>
 * ```
 */

// ============================================================================
// Types
// ============================================================================

export type {
  // Base types
  HeaderSize,
  HeaderVariant,
  HeaderLayout,
  HeaderAlignment,

  // Breadcrumb
  BreadcrumbItem,

  // Actions
  HeaderAction,
  HeaderActionGroup,

  // Content (Config types - use these for props configuration)
  HeaderBadgeConfig,
  HeaderSearchConfig,
  HeaderMetaItem,
  HeaderStats,
  HeaderSlots,

  // Props
  HeaderBaseProps,
  HeaderNavigationProps,
  HeaderActionProps,
  HeaderContentProps,
  HeaderProps,

  // Compound component props
  HeaderRootProps,
  HeaderTitleProps,
  HeaderActionsProps,
  HeaderBreadcrumbsProps,
  HeaderSearchProps,
  HeaderToolbarProps,
  HeaderSectionProps,
  HeaderBackProps,
  HeaderBadgeProps,
  HeaderMetaProps,

  // Context
  HeaderContextValue,

  // Presets
  HeaderPresetName,
  HeaderPreset,
} from "./types"

export {
  HEADER_PRESETS,
  ICON_SIZES,
  TITLE_SIZES,
  SUBTITLE_SIZES,
  PADDING_SIZES,
} from "./types"

// ============================================================================
// Context
// ============================================================================

export {
  useHeaderContext,
  useHeaderContextSafe,
  HeaderProvider,
  useDynamicHeader,
  useDynamicHeaderSafe,
  DynamicHeaderProvider,
  useSetHeaderTitle,
  useSetHeaderBreadcrumbs,
  useSetHeaderActions,
} from "./context"

export type {
  HeaderProviderProps,
  DynamicHeaderState,
  DynamicHeaderContextValue,
  DynamicHeaderProviderProps,
} from "./context"

// ============================================================================
// Components (Compound)
// ============================================================================

export {
  Header,
  HeaderRoot,
  HeaderSection,
  HeaderTitle,
  HeaderActions,
  HeaderActionGroupMenu,
  HeaderBreadcrumbs,
  HeaderSearch,
  HeaderBadge,
  HeaderMeta,
  HeaderToolbar,
  HeaderBack,
} from "./Header"

// ============================================================================
// Presets (Pre-configured Headers)
// ============================================================================

export {
  FeatureHeader,
  SidebarHeader,
  ContainerHeader,
  PageHeader,
  MinimalHeader,
  StandardFeatureHeader,
} from "./presets"

export type {
  FeatureHeaderProps,
  SidebarHeaderProps,
  ContainerHeaderProps,
  PageHeaderProps,
  MinimalHeaderProps,
  StandardFeatureHeaderProps,
} from "./presets"

// Mobile Header
export { MobileHeader } from "./MobileHeader"
export type { MobileHeaderProps } from "./MobileHeader"

// ============================================================================
// Utilities (shared helpers)
// ============================================================================

export {
  getActiveFeatureSlug,
  slugToDisplayName,
  getPageTitle,
  EXCLUDED_FEATURE_SLUGS,
} from "./utils"

// ============================================================================
// Styles (for custom implementations)
// ============================================================================

export {
  getHeaderContainerClasses,
  getHeaderSectionClasses,
  getTitleWrapperClasses,
  getTitleClasses,
  getSubtitleClasses,
  getIconContainerClasses,
  getIconSizeClass,
  getIconSizePixels,
  getActionsContainerClasses,
  getBreadcrumbsContainerClasses,
  getBreadcrumbItemClasses,
  getBreadcrumbSeparatorClasses,
  getSearchContainerClasses,
  getSearchInputClasses,
  getHeaderBadgeClasses,
  getMetaContainerClasses,
  getMetaItemClasses,
  getMetaSeparatorClasses,
  getToolbarClasses,
  getBackButtonClasses,
} from "./styles"

// ============================================================================
// Controls (Search, Filter, Sort, DateRange, Pagination)
// ============================================================================

export {
  HeaderControls,
  SearchControl,
  FilterControl,
  SortControl,
  DateRangeControl,
  PaginationControl,
} from "./components"

// Note: Types are exported without SortOption to avoid conflict with sidebar/secondary
// Import SortOption from "./components/HeaderControls" directly if needed
export type {
  HeaderControlsProps,
  SearchControlProps,
  FilterControlProps,
  FilterChip,
  SortControlProps,
  // SortOption - conflicts with sidebar/secondary, import directly if needed
  DateRangeControlProps,
  DateRange,
  PaginationControlProps,
} from "./components"

// ============================================================================
// ViewToolbar (Comprehensive data view toolbar)
// ============================================================================

export { ViewToolbar, DEFAULT_VIEW_OPTIONS } from "./components"
export type {
  ViewToolbarProps,
  SortState,
  FilterOption,
  FilterCondition,
  ViewMode,
  ViewOption,
} from "./components"

