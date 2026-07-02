import { useState, useCallback, useMemo } from 'react';
import type { Filter as UIFilter } from '@/components/ui/filters';
import type { Property } from '@/frontend/shared/foundation/types/universal-database';
import type { ConvexQueryFilter } from './queryBuilder';
import { useFilters } from './useFilters';
import { buildConvexQuery } from './queryBuilder';

/**
 * Configuration untuk feature-specific filters
 * 
 * Setiap feature bisa customize:
 * - Default filters
 * - Custom filter field options
 * - Icons dan labels
 */
export interface FeatureFilterConfig {
  /**
   * Feature identifier (e.g., 'database', 'documents', 'tasks')
   */
  featureId: string;
  
  /**
   * Database properties untuk auto-generate filter fields
   */
  properties: Property[];
  
  /**
   * Initial/default filters yang langsung aktif
   * @example [createFilter('status', 'equals', ['active'])]
   */
  defaultFilters?: UIFilter[];
  
  /**
   * Custom options untuk specific properties
   * Override auto-generated options dengan custom ones
   * 
   * @example
   * {
   *   status: [
   *     { value: 'active', label: 'Active', icon: <Check /> },
   *     { value: 'inactive', label: 'Inactive', icon: <X /> }
   *   ]
   * }
   */
  customOptions?: Record<string, Array<{ value: string; label: string; icon?: React.ReactNode }>>;
  
  /**
   * Property display overrides (custom labels, icons)
   * 
   * @example
   * {
   *   created_at: { label: 'Date Created', icon: <Calendar /> }
   * }
   */
  propertyOverrides?: Record<string, { label?: string; icon?: React.ReactNode; className?: string }>;
  
  /**
   * Group properties by category for better organization
   * 
   * @example
   * [
   *   { group: 'Basic Info', fields: ['name', 'email', 'phone'] },
   *   { group: 'Status', fields: ['status', 'priority'] }
   * ]
   */
  groups?: Array<{ group: string; fields: string[] }>;
  
  /**
   * Callback saat filters berubah
   * Otomatis dipanggil dengan filters + Convex query
   */
  onFiltersChange?: (filters: UIFilter[], query: ConvexQueryFilter) => void;
  
  /**
   * Enable/disable persistence ke localStorage
   * @default true
   */
  persistFilters?: boolean;
  
  /**
   * LocalStorage key untuk persist filters
   * @default `${featureId}-filters`
   */
  storageKey?: string;
}

export interface UseFeatureFiltersReturn {
  /**
   * Current active filters
   */
  filters: UIFilter[];
  
  /**
   * Filter field configurations untuk UI component
   */
  filterFields: any[];
  
  /**
   * Convex query object untuk backend
   */
  convexQuery: ConvexQueryFilter | null;
  
  /**
   * Has active filters
   */
  hasFilters: boolean;
  
  /**
   * Update filters (dari UI component)
   */
  setFilters: (filters: UIFilter[]) => void;
  
  /**
   * Clear all filters
   */
  clearFilters: () => void;
  
  /**
   * Add a filter
   */
  addFilter: (filter: UIFilter) => void;
  
  /**
   * Remove a filter by id
   */
  removeFilter: (filterId: string) => void;
  
  /**
   * Reset to default filters
   */
  resetToDefaults: () => void;
}

/**
 * Universal hook untuk manage filters di semua features
 * 
 * @example
 * ```tsx
 * const databaseFilters = useFeatureFilters({
 *   featureId: 'database',
 *   properties: databaseProperties,
 *   defaultFilters: [
 *     createFilter('status', 'equals', ['active'])
 *   ],
 *   onFiltersChange: (filters, query) => {
 *     // Pass query ke Convex
 *     refetchRecords({ filter: query });
 *   }
 * });
 * 
 * return (
 *   <DatabaseFilters
 *     properties={databaseProperties}
 *     filters={databaseFilters.filters}
 *     onFiltersChange={databaseFilters.setFilters}
 *   />
 * );
 * ```
 */
export function useFeatureFilters(config: FeatureFilterConfig): UseFeatureFiltersReturn {
  const {
    featureId,
    properties,
    defaultFilters = [],
    customOptions,
    propertyOverrides,
    groups,
    onFiltersChange,
    persistFilters = true,
    storageKey = `${featureId}-filters`,
  } = config;
  
  // Load initial filters dari localStorage atau defaults
  const getInitialFilters = useCallback((): UIFilter[] => {
    if (persistFilters && typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(storageKey);
        if (stored) {
          return JSON.parse(stored);
        }
      } catch (error) {
        console.warn(`Failed to load filters from localStorage:`, error);
      }
    }
    return defaultFilters;
  }, [persistFilters, storageKey, defaultFilters]);
  
  const [filters, setFiltersState] = useState<UIFilter[]>(getInitialFilters);
  
  // Auto-generate filter fields dari properties
  const { filterFields: baseFilterFields } = useFilters({ properties });
  
  // Apply customizations ke filter fields
  const filterFields = useMemo(() => {
    let fields = baseFilterFields.map(field => {
      const fieldKey = field.key || '';
      
      // Apply property overrides
      if (propertyOverrides?.[fieldKey]) {
        const override = propertyOverrides[fieldKey];
        return {
          ...field,
          label: override.label || field.label,
          icon: override.icon || field.icon,
          className: override.className || field.className,
        };
      }
      
      // Apply custom options untuk select/multiselect
      if (customOptions?.[fieldKey]) {
        return {
          ...field,
          options: customOptions[fieldKey],
        };
      }
      
      return field;
    });
    
    // Apply grouping jika ada
    if (groups && groups.length > 0) {
      const grouped = groups.map(g => ({
        group: g.group,
        fields: fields.filter(f => g.fields.includes(f.key || '')),
      }));
      
      // Flatten back to array dengan group info
      fields = grouped.flatMap(g => 
        g.fields.map(f => ({ ...f, group: g.group }))
      );
    }
    
    return fields;
  }, [baseFilterFields, customOptions, propertyOverrides, groups]);
  
  // Build Convex query dari current filters
  const convexQuery = useMemo((): ConvexQueryFilter | null => {
    if (filters.length === 0) return null;
    
    const ourFilters = filters.map(f => ({
      key: f.field,
      operator: f.operator,
      value: f.values.length === 1 ? f.values[0] : f.values,
    }));
    
    const typedPropertyTypes: Record<string, any> = {};
    properties.forEach(prop => {
      typedPropertyTypes[prop.key] = prop.type;
    });
    
    return buildConvexQuery(ourFilters, typedPropertyTypes, 'AND');
  }, [filters, properties]);
  
  // Save filters ke localStorage
  const saveFilters = useCallback((newFilters: UIFilter[]) => {
    if (persistFilters && typeof window !== 'undefined') {
      try {
        localStorage.setItem(storageKey, JSON.stringify(newFilters));
      } catch (error) {
        console.warn(`Failed to save filters to localStorage:`, error);
      }
    }
  }, [persistFilters, storageKey]);
  
  // Set filters with callback
  const setFilters = useCallback((newFilters: UIFilter[]) => {
    setFiltersState(newFilters);
    saveFilters(newFilters);
    
    // Build query dan notify parent
    if (onFiltersChange) {
      if (newFilters.length > 0) {
        const ourFilters = newFilters.map(f => ({
          key: f.field,
          operator: f.operator,
          value: f.values.length === 1 ? f.values[0] : f.values,
        }));
        
        const typedPropertyTypes: Record<string, any> = {};
        properties.forEach(prop => {
          typedPropertyTypes[prop.key] = prop.type;
        });
        
        const query = buildConvexQuery(ourFilters, typedPropertyTypes, 'AND');
        onFiltersChange(newFilters, query);
      } else {
        onFiltersChange(newFilters, {
          operation: 'AND',
          filters: [],
        });
      }
    }
  }, [onFiltersChange, properties, saveFilters]);
  
  const clearFilters = useCallback(() => {
    setFilters([]);
  }, [setFilters]);
  
  const addFilter = useCallback((filter: UIFilter) => {
    setFilters([...filters, filter]);
  }, [filters, setFilters]);
  
  const removeFilter = useCallback((filterId: string) => {
    setFilters(filters.filter(f => f.id !== filterId));
  }, [filters, setFilters]);
  
  const resetToDefaults = useCallback(() => {
    setFilters(defaultFilters);
  }, [defaultFilters, setFilters]);
  
  return {
    filters,
    filterFields,
    convexQuery,
    hasFilters: filters.length > 0,
    setFilters,
    clearFilters,
    addFilter,
    removeFilter,
    resetToDefaults,
  };
}
