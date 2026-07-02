import { useState, useCallback, useMemo } from 'react';
import type { Property } from '@/frontend/shared/foundation/types/universal-database';
import { propertiesToFilterFields } from './fieldConverters';
import { buildConvexQuery, buildConvexQueryFromGroup, applyQueryFilter } from './queryBuilder';
import type { Filter, FilterGroup, ConvexQueryFilter } from './queryBuilder';
import type { FilterFieldConfig } from '@/components/ui/filters';

export interface UseFiltersOptions {
  /**
   * Database properties untuk generate filter fields
   */
  properties: Property[];
  
  /**
   * Initial filters (optional)
   */
  initialFilters?: Filter[];
  
  /**
   * Initial filter operation (default: AND)
   */
  initialOperation?: 'AND' | 'OR';
  
  /**
   * Group filter fields by type (optional)
   */
  groupByType?: boolean;
  
  /**
   * Callback saat filters berubah
   */
  onFiltersChange?: (filters: Filter[], convexQuery: ConvexQueryFilter) => void;
}

export interface UseFiltersReturn {
  /**
   * Current filters
   */
  filters: Filter[];
  
  /**
   * Filter operation (AND/OR)
   */
  operation: 'AND' | 'OR';
  
  /**
   * Filter field configurations untuk UI
   */
  filterFields: FilterFieldConfig[];
  
  /**
   * Convex query object
   */
  convexQuery: ConvexQueryFilter;
  
  /**
   * Property types map (key -> type)
   */
  propertyTypes: Record<string, string>;
  
  /**
   * Add new filter
   */
  addFilter: (filter: Filter) => void;
  
  /**
   * Update existing filter
   */
  updateFilter: (index: number, filter: Filter) => void;
  
  /**
   * Remove filter
   */
  removeFilter: (index: number) => void;
  
  /**
   * Clear all filters
   */
  clearFilters: () => void;
  
  /**
   * Set operation (AND/OR)
   */
  setOperation: (operation: 'AND' | 'OR') => void;
  
  /**
   * Set filters directly
   */
  setFilters: (filters: Filter[]) => void;
  
  /**
   * Apply filters ke data (client-side filtering)
   */
  applyFilters: <T extends Record<string, any>>(data: T[]) => T[];
  
  /**
   * Check if has active filters
   */
  hasFilters: boolean;
  
  /**
   * Get filter count
   */
  filterCount: number;
}

/**
 * Hook for database filter management
 * 
 * @example
 * ```tsx
 * const { 
 *   filters, 
 *   filterFields, 
 *   convexQuery,
 *   addFilter, 
 *   removeFilter,
 *   applyFilters 
 * } = useFilters({
 *   properties: databaseProperties,
 *   onFiltersChange: (filters, query) => {
 *     // Update Convex query
 *     refetch({ filter: query });
 *   }
 * });
 * ```
 */
export function useFilters(options: UseFiltersOptions): UseFiltersReturn {
  const {
    properties,
    initialFilters = [],
    initialOperation = 'AND',
    groupByType = false,
    onFiltersChange,
  } = options;
  
  // State
  const [filters, setFiltersState] = useState<Filter[]>(initialFilters);
  const [operation, setOperation] = useState<'AND' | 'OR'>(initialOperation);
  
  // Generate filter fields dari properties
  const filterFields = useMemo(() => {
    return propertiesToFilterFields(properties, {
      groupByType,
      excludeTypes: ['button'], // Button tidak perlu filter
    });
  }, [properties, groupByType]);
  
  // Generate property types map
  const propertyTypes = useMemo(() => {
    return properties.reduce((acc, prop) => {
      acc[prop.key] = prop.type;
      return acc;
    }, {} as Record<string, string>);
  }, [properties]);
  
  // Generate Convex query
  const convexQuery = useMemo(() => {
    if (filters.length === 0) {
      return {
        operation,
        filters: [],
      };
    }
    
    return buildConvexQuery(filters, propertyTypes as any, operation);
  }, [filters, propertyTypes, operation]);
  
  // Callback saat filters berubah
  const notifyChange = useCallback((newFilters: Filter[]) => {
    if (onFiltersChange) {
      const query = buildConvexQuery(newFilters, propertyTypes as any, operation);
      onFiltersChange(newFilters, query);
    }
  }, [onFiltersChange, propertyTypes, operation]);
  
  // Add filter
  const addFilter = useCallback((filter: Filter) => {
    setFiltersState(prev => {
      const newFilters = [...prev, filter];
      notifyChange(newFilters);
      return newFilters;
    });
  }, [notifyChange]);
  
  // Update filter
  const updateFilter = useCallback((index: number, filter: Filter) => {
    setFiltersState(prev => {
      const newFilters = [...prev];
      newFilters[index] = filter;
      notifyChange(newFilters);
      return newFilters;
    });
  }, [notifyChange]);
  
  // Remove filter
  const removeFilter = useCallback((index: number) => {
    setFiltersState(prev => {
      const newFilters = prev.filter((_, i) => i !== index);
      notifyChange(newFilters);
      return newFilters;
    });
  }, [notifyChange]);
  
  // Clear filters
  const clearFilters = useCallback(() => {
    setFiltersState([]);
    notifyChange([]);
  }, [notifyChange]);
  
  // Set filters
  const setFilters = useCallback((newFilters: Filter[]) => {
    setFiltersState(newFilters);
    notifyChange(newFilters);
  }, [notifyChange]);
  
  // Apply filters to data (client-side)
  const applyFilters = useCallback(<T extends Record<string, any>>(data: T[]): T[] => {
    if (filters.length === 0) return data;
    
    return data.filter(item => applyQueryFilter(item, convexQuery));
  }, [filters, convexQuery]);
  
  // Computed values
  const hasFilters = filters.length > 0;
  const filterCount = filters.length;
  
  return {
    filters,
    operation,
    filterFields,
    convexQuery,
    propertyTypes,
    addFilter,
    updateFilter,
    removeFilter,
    clearFilters,
    setOperation,
    setFilters,
    applyFilters,
    hasFilters,
    filterCount,
  };
}

/**
 * Hook for filter group management (advanced)
 * Supports nested filter groups with AND/OR logic
 */
export interface UseFilterGroupOptions {
  properties: Property[];
  initialFilterGroup?: FilterGroup;
  onFilterGroupChange?: (filterGroup: FilterGroup, convexQuery: ConvexQueryFilter) => void;
}

export interface UseFilterGroupReturn {
  filterGroup: FilterGroup;
  filterFields: FilterFieldConfig[];
  convexQuery: ConvexQueryFilter;
  propertyTypes: Record<string, string>;
  updateFilterGroup: (filterGroup: FilterGroup) => void;
  clearFilterGroup: () => void;
  applyFilters: <T extends Record<string, any>>(data: T[]) => T[];
}

export function useFilterGroup(options: UseFilterGroupOptions): UseFilterGroupReturn {
  const {
    properties,
    initialFilterGroup = { operation: 'AND', filters: [] },
    onFilterGroupChange,
  } = options;
  
  const [filterGroup, setFilterGroup] = useState<FilterGroup>(initialFilterGroup);
  
  const filterFields = useMemo(() => {
    return propertiesToFilterFields(properties, {
      groupByType: false,
      excludeTypes: ['button'],
    });
  }, [properties]);
  
  const propertyTypes = useMemo(() => {
    return properties.reduce((acc, prop) => {
      acc[prop.key] = prop.type;
      return acc;
    }, {} as Record<string, string>);
  }, [properties]);
  
  const convexQuery = useMemo(() => {
    return buildConvexQueryFromGroup(filterGroup, propertyTypes as any);
  }, [filterGroup, propertyTypes]);
  
  const updateFilterGroup = useCallback((newFilterGroup: FilterGroup) => {
    setFilterGroup(newFilterGroup);
    if (onFilterGroupChange) {
      const query = buildConvexQueryFromGroup(newFilterGroup, propertyTypes as any);
      onFilterGroupChange(newFilterGroup, query);
    }
  }, [onFilterGroupChange, propertyTypes]);
  
  const clearFilterGroup = useCallback(() => {
    const emptyGroup: FilterGroup = { operation: 'AND', filters: [] };
    setFilterGroup(emptyGroup);
    if (onFilterGroupChange) {
      const query = buildConvexQueryFromGroup(emptyGroup, propertyTypes as any);
      onFilterGroupChange(emptyGroup, query);
    }
  }, [onFilterGroupChange, propertyTypes]);
  
  const applyFilters = useCallback(<T extends Record<string, any>>(data: T[]): T[] => {
    if (filterGroup.filters.length === 0) return data;
    
    return data.filter(item => applyQueryFilter(item, convexQuery));
  }, [filterGroup, convexQuery]);
  
  return {
    filterGroup,
    filterFields,
    convexQuery,
    propertyTypes,
    updateFilterGroup,
    clearFilterGroup,
    applyFilters,
  };
}
