"use client";

import { useCallback } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Filters, type Filter as UIFilter, createFilter } from "@/components/ui/filters";
import { useFilters, buildConvexQuery } from "@/frontend/slices/database/filters";
import type { Property } from "@/frontend/shared/foundation/types/universal-database";
import type { ConvexQueryFilter, Filter } from "@/frontend/slices/database/filters";

export interface DatabaseFiltersProps {
  /**
   * Database properties untuk generate filter fields
   */
  properties: Property[];
  
  /**
   * Current active filters
   */
  filters: UIFilter[];
  
  /**
   * Callback saat filters berubah
   */
  onFiltersChange: (filters: UIFilter[], query: ConvexQueryFilter) => void;
  
  /**
   * Variant for filter chips
   */
  variant?: "solid" | "outline";
  
  /**
   * Size for filter chips
   */
  size?: "sm" | "md" | "lg";
  
  /**
   * Custom className
   */
  className?: string;
}

/**
 * DatabaseFilters Component
 * 
 * Integrates the filter system with the database toolbar.
 * Displays active filters as visible chips, like the FiltersDemo example.
 */
export function DatabaseFilters({
  properties,
  filters,
  onFiltersChange,
  variant = "outline",
  size = "sm",
  className,
}: DatabaseFiltersProps) {
  const {
    filterFields,
  } = useFilters({
    properties,
  });
  
  // Convert UI filters to our filter format and notify parent
  const handleFiltersChange = useCallback((newFilters: UIFilter[]) => {
    // Convert ke format kita dan build query
    const ourFilters: Filter[] = newFilters.map(f => ({
      key: f.field,
      operator: f.operator,
      value: f.values.length === 1 ? f.values[0] : f.values,
    }));
    
    // Build convex query dari filters
    if (ourFilters.length > 0) {
      // Create property types map with proper typing
      const typedPropertyTypes: Record<string, any> = {};
      properties.forEach(prop => {
        typedPropertyTypes[prop.key] = prop.type;
      });
      
      const query = buildConvexQuery(ourFilters, typedPropertyTypes, 'AND');
      onFiltersChange(newFilters, query);
    } else {
      // Empty query
      onFiltersChange(newFilters, {
        operation: 'AND',
        filters: [],
      });
    }
  }, [onFiltersChange, properties]);
  
  const handleClearAll = () => {
    onFiltersChange([], {
      operation: 'AND',
      filters: [],
    });
  };
  
  return (
    <div className="flex items-start gap-2.5 flex-1">
      <div className="flex-1">
        <Filters
          fields={filterFields}
          filters={filters}
          onChange={handleFiltersChange}
          showAddButton={true}
          variant={variant}
          size={size}
          radius="md"
          className={className}
        />
      </div>
      
      {filters.length > 0 && (
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleClearAll}
          className="gap-2"
        >
          <X className="h-4 w-4" />
          Clear
        </Button>
      )}
    </div>
  );
}
