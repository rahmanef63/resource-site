/**
 * Database Filters System
 * 
 * Scalable, customizable filter system yang terintegrasi dengan Universal Database.
 * Mendukung semua 21 PropertyTypes secara dinamis.
 * 
 * @example Basic Usage
 * ```tsx
 * import { useFilters } from '@/frontend/slices/database/filters';
 * 
 * function MyComponent({ properties }) {
 *   const { 
 *     filters, 
 *     filterFields, 
 *     convexQuery,
 *     addFilter, 
 *     removeFilter 
 *   } = useFilters({
 *     properties,
 *     onFiltersChange: (filters, query) => {
 *       // Send query to Convex
 *       refetch({ filter: query });
 *     }
 *   });
 *   
 *   return (
 *     <FiltersContent
 *       fields={filterFields}
 *       filters={filters}
 *       onAdd={addFilter}
 *       onRemove={removeFilter}
 *     />
 *   );
 * }
 * ```
 * 
 * @example Advanced Usage with Groups
 * ```tsx
 * import { useFilterGroup } from '@/frontend/slices/database/filters';
 * 
 * function MyComponent({ properties }) {
 *   const { 
 *     filterGroup, 
 *     filterFields, 
 *     convexQuery,
 *     updateFilterGroup 
 *   } = useFilterGroup({
 *     properties,
 *     initialFilterGroup: {
 *       operation: 'AND',
 *       filters: [],
 *       groups: []
 *     },
 *     onFilterGroupChange: (group, query) => {
 *       refetch({ filter: query });
 *     }
 *   });
 *   
 *   return <Filters {...} />;
 * }
 * ```
 * 
 * @example Manual Conversion
 * ```tsx
 * import { 
 *   propertyToFilterField, 
 *   buildConvexQuery 
 * } from '@/frontend/slices/database/filters';
 * 
 * // Convert single property
 * const filterField = propertyToFilterField(property);
 * 
 * // Build Convex query
 * const query = buildConvexQuery(filters, propertyTypes);
 * 
 * // Apply client-side filtering
 * const filteredData = data.filter(item => 
 *   applyQueryFilter(item, query)
 * );
 * ```
 */

// Type exports
export type {
  // Types
  DatabaseFilterConfig,
  FilterQuery,
} from './types';

export type {
  // Query builder types
  ConvexFilterExpression,
  ConvexQueryFilter,
  Filter,
  FilterGroup,
} from './queryBuilder';

export type {
  // Hook types
  UseFiltersOptions,
  UseFiltersReturn,
  UseFilterGroupOptions,
  UseFilterGroupReturn,
} from './useFilters';

// Constant exports
export {
  PROPERTY_TYPE_OPERATORS,
  PROPERTY_TYPE_TO_FILTER_TYPE,
  DEFAULT_OPERATORS,
} from './types';

// Function exports - Field Converters
export {
  propertyToFilterField,
  propertiesToFilterFields,
  getSelectOptions,
  getFilterFieldByPropertyKey,
  getFilterFieldsByPropertyKeys,
} from './fieldConverters';

// Function exports - Query Builder
export {
  buildConvexQuery,
  buildConvexQueryFromGroup,
  applyFilterExpression,
  applyQueryFilter,
  queryToString,
} from './queryBuilder';

// Hook exports
export {
  useFilters,
  useFilterGroup,
} from './useFilters';
export {
  useFeatureFilters,
} from './useFeatureFilters';
export type {
  FeatureFilterConfig,
  UseFeatureFiltersReturn,
} from './useFeatureFilters';
