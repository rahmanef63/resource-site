"use client";

import { useState, useMemo, useCallback } from "react";

export type SortDirection = "asc" | "desc" | null;

export interface ColumnDef<T> {
  key: keyof T;
  label: string;
  sortable?: boolean;
  filterable?: boolean;
  filterFn?: (item: T, filterValue: any) => boolean;
  sortFn?: (a: T, b: T) => number;
}

export interface UseTableSortAndFilterProps<T> {
  data: T[] | undefined;
  columns: ColumnDef<T>[];
  initialFilters?: Record<string, any>;
  initialSort?: { key: keyof T; direction: SortDirection };
}

export function useTableSortAndFilter<T extends Record<string, any>>({
  data,
  columns,
  initialFilters = {},
  initialSort = { key: "", direction: null },
}: UseTableSortAndFilterProps<T>) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<Record<string, any>>(initialFilters);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof T;
    direction: SortDirection;
  }>(initialSort);

  // Handle column header click for sorting
  const handleSort = useCallback(
    (columnKey: keyof T) => {
      const column = columns.find((col) => col.key === columnKey);
      if (!column?.sortable) return;

      setSortConfig((current) => {
        if (current.key !== columnKey) {
          // New column, sort ascending
          return { key: columnKey, direction: "asc" };
        } else if (current.direction === "asc") {
          // Same column, switch to descending
          return { key: columnKey, direction: "desc" };
        } else if (current.direction === "desc") {
          // Same column, remove sort
          return { key: columnKey, direction: null };
        }
        return current;
      });
    },
    [columns]
  );

  // Handle filter changes
  const handleFilter = useCallback((filterKey: string, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [filterKey]: value,
    }));
  }, []);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setSearchQuery("");
    setFilters(initialFilters);
    setSortConfig({ key: "", direction: null });
  }, [initialFilters]);

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return (
      searchQuery ||
      Object.entries(filters).some(([key, value]) => {
        if (Array.isArray(value)) return value.length > 0;
        return value !== "" && value !== null && value !== undefined;
      }) ||
      sortConfig.direction !== null
    );
  }, [searchQuery, filters, sortConfig.direction]);

  // Filter and sort data
  const processedData = useMemo(() => {
    if (!data) return [];

    let filtered = [...data];

    // Apply text search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((item) => {
        // Search in all filterable columns
        return columns.some((column) => {
          if (!column.filterable) return false;
          const value = item[column.key];
          if (typeof value === "string") {
            return value.toLowerCase().includes(query);
          }
          if (typeof value === "number") {
            return value.toString().includes(query);
          }
          return false;
        });
      });
    }

    // Apply column filters
    Object.entries(filters).forEach(([filterKey, filterValue]) => {
      const column = columns.find((col) => col.key === filterKey);
      if (!column || filterValue === "" || filterValue === null || filterValue === undefined) return;

      if (Array.isArray(filterValue)) {
        if (filterValue.length === 0) return;
        filtered = filtered.filter((item) => filterValue.includes(item[filterKey]));
      } else {
        if (column.filterFn) {
          filtered = filtered.filter((item) => column.filterFn!(item, filterValue));
        } else {
          filtered = filtered.filter((item) => item[filterKey] === filterValue);
        }
      }
    });

    // Apply sorting
    if (sortConfig.key && sortConfig.direction) {
      const column = columns.find((col) => col.key === sortConfig.key);

      filtered.sort((a, b) => {
        const aValue = a[sortConfig.key] as unknown;
        const bValue = b[sortConfig.key] as unknown;

        // Use custom sort function if provided
        if (column?.sortFn) {
          const result = column.sortFn(a, b);
          return sortConfig.direction === "desc" ? -result : result;
        }

        // Default sorting logic
        let comparison = 0;
        if (aValue === null || aValue === undefined) comparison = -1;
        else if (bValue === null || bValue === undefined) comparison = 1;
        else if (typeof aValue === "string" && typeof bValue === "string") {
          comparison = aValue.localeCompare(bValue);
        } else if (typeof aValue === "number" && typeof bValue === "number") {
          comparison = aValue - bValue;
        } else if (
          typeof aValue === "object" &&
          aValue instanceof Date &&
          typeof bValue === "object" &&
          bValue instanceof Date
        ) {
          comparison = aValue.getTime() - bValue.getTime();
        } else {
          // Convert to string comparison as fallback
          comparison = String(aValue).localeCompare(String(bValue));
        }

        return sortConfig.direction === "desc" ? -comparison : comparison;
      });
    }

    return filtered;
  }, [data, searchQuery, filters, sortConfig, columns]);

  return {
    // State
    searchQuery,
    filters,
    sortConfig,

    // Actions
    setSearchQuery,
    handleSort,
    handleFilter,
    clearFilters,

    // Computed
    hasActiveFilters,
    processedData,
  };
}
