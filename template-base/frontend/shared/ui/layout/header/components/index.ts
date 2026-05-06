/**
 * Header Components
 * 
 * Individual header sub-components exported for flexibility.
 * Use Header compound component for most cases.
 */

// Core Header Components
export { HeaderRoot } from "./HeaderRoot"
export { HeaderSection } from "./HeaderSection"
export { HeaderTitle } from "./HeaderTitle"
export { HeaderActions } from "./HeaderActions"
export { HeaderActionGroupMenu } from "./HeaderActionGroup"
export { HeaderBreadcrumbs } from "./HeaderBreadcrumbs"
export { HeaderSearch } from "./HeaderSearch"
export { HeaderBadge } from "./HeaderBadge"
export { HeaderMeta } from "./HeaderMeta"
export { HeaderToolbar } from "./HeaderToolbar"
export { HeaderBack } from "./HeaderBack"

// Controls (Search, Filter, Sort, DateRange, Pagination)
export {
  HeaderControls,
  SearchControl,
  FilterControl,
  SortControl,
  DateRangeControl,
  PaginationControl,
} from "./HeaderControls"

export type {
  HeaderControlsProps,
  SearchControlProps,
  FilterControlProps,
  FilterChip,
  SortControlProps,
  SortOption,
  DateRangeControlProps,
  DateRange,
  PaginationControlProps,
} from "./HeaderControls"

// ViewToolbar - Comprehensive toolbar for data views
export { ViewToolbar, DEFAULT_VIEW_OPTIONS } from "./ViewToolbar"
export type {
  ViewToolbarProps,
  SortState,
  FilterOption,
  FilterCondition,
  ViewMode,
  ViewOption,
} from "./ViewToolbar"

