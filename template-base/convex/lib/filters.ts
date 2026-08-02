/**
 * Convex Filter Helpers
 * 
 * Universal helper functions untuk apply filters di Convex queries.
 * Dapat digunakan di semua features yang membutuhkan filtering.
 * 
 * @example
 * ```ts
 * import { applyFilters } from '@/convex/lib/filters';
 * 
 * export const listRecords = query({
 *   args: {
 *     workspaceId: v.id("workspaces"),
 *     databaseId: v.id("databases"),
 *     filter: v.optional(v.any()),
 *   },
 *   handler: async (ctx, args) => {
 *     let query = ctx.db
 *       .query("records")
 *       .withIndex("by_workspace_and_database", q =>
 *         q.eq("workspaceId", args.workspaceId)
 *          .eq("databaseId", args.databaseId)
 *       );
 *     
 *     // Apply filters
 *     if (args.filter) {
 *       query = applyFilters(query, args.filter);
 *     }
 *     
 *     return await query.collect();
 *   },
 * });
 * ```
 */

// ============================================================================
// Types (copied from frontend untuk avoid cross-boundary imports)
// ============================================================================

export interface FilterExpression {
  field: string;
  operator: string;
  value: any;
}

export interface ConvexQueryFilter {
  operation: 'AND' | 'OR';
  filters: Array<FilterExpression | ConvexQueryFilter>;
}

/**
 * Apply filter expression ke Convex query
 * 
 * Supports all operators:
 * - Text: contains, not_contains, equals, not_equals, starts_with, ends_with, empty, not_empty
 * - Number: equals, not_equals, greater_than, less_than, greater_than_or_equal, less_than_or_equal, empty, not_empty
 * - Boolean: equals, not_equals
 * - Select: equals, not_equals, contains, not_contains (for multi-select)
 * - Date: equals, not_equals, greater_than, less_than, between
 */
export function applyFilterExpression(record: any, filter: FilterExpression): boolean {
  const { field, operator, value } = filter;
  const fieldValue = record.data?.[field] ?? record[field];
  
  // Handle empty/not_empty operators
  if (operator === 'empty') {
    return fieldValue === null || fieldValue === undefined || fieldValue === '';
  }
  if (operator === 'not_empty') {
    return fieldValue !== null && fieldValue !== undefined && fieldValue !== '';
  }
  
  // If field is empty and operator is not empty/not_empty, return false
  if (fieldValue === null || fieldValue === undefined) {
    return false;
  }
  
  // Text operators
  if (operator === 'contains') {
    return String(fieldValue).toLowerCase().includes(String(value).toLowerCase());
  }
  if (operator === 'not_contains') {
    return !String(fieldValue).toLowerCase().includes(String(value).toLowerCase());
  }
  if (operator === 'starts_with') {
    return String(fieldValue).toLowerCase().startsWith(String(value).toLowerCase());
  }
  if (operator === 'ends_with') {
    return String(fieldValue).toLowerCase().endsWith(String(value).toLowerCase());
  }
  
  // Equality operators
  if (operator === 'equals') {
    // Handle array values (for multi-select)
    if (Array.isArray(value)) {
      return value.includes(fieldValue);
    }
    // Handle date comparison
    if (value instanceof Date || typeof value === 'number') {
      return fieldValue === value || new Date(fieldValue).getTime() === new Date(value).getTime();
    }
    return fieldValue === value;
  }
  if (operator === 'not_equals') {
    if (Array.isArray(value)) {
      return !value.includes(fieldValue);
    }
    if (value instanceof Date || typeof value === 'number') {
      return fieldValue !== value && new Date(fieldValue).getTime() !== new Date(value).getTime();
    }
    return fieldValue !== value;
  }
  
  // Number/Date comparison operators
  if (operator === 'greater_than') {
    const numValue = typeof value === 'number' ? value : new Date(value).getTime();
    const numField = typeof fieldValue === 'number' ? fieldValue : new Date(fieldValue).getTime();
    return numField > numValue;
  }
  if (operator === 'less_than') {
    const numValue = typeof value === 'number' ? value : new Date(value).getTime();
    const numField = typeof fieldValue === 'number' ? fieldValue : new Date(fieldValue).getTime();
    return numField < numValue;
  }
  if (operator === 'greater_than_or_equal') {
    const numValue = typeof value === 'number' ? value : new Date(value).getTime();
    const numField = typeof fieldValue === 'number' ? fieldValue : new Date(fieldValue).getTime();
    return numField >= numValue;
  }
  if (operator === 'less_than_or_equal') {
    const numValue = typeof value === 'number' ? value : new Date(value).getTime();
    const numField = typeof fieldValue === 'number' ? fieldValue : new Date(fieldValue).getTime();
    return numField <= numValue;
  }
  
  // Between operator (for date ranges)
  if (operator === 'between' && Array.isArray(value) && value.length === 2) {
    const [start, end] = value;
    const numField = typeof fieldValue === 'number' ? fieldValue : new Date(fieldValue).getTime();
    const numStart = typeof start === 'number' ? start : new Date(start).getTime();
    const numEnd = typeof end === 'number' ? end : new Date(end).getTime();
    return numField >= numStart && numField <= numEnd;
  }
  
  // Array contains (for multi-select fields)
  if (operator === 'array_contains') {
    if (!Array.isArray(fieldValue)) return false;
    if (Array.isArray(value)) {
      return value.some(v => fieldValue.includes(v));
    }
    return fieldValue.includes(value);
  }
  if (operator === 'array_not_contains') {
    if (!Array.isArray(fieldValue)) return true;
    if (Array.isArray(value)) {
      return !value.some(v => fieldValue.includes(v));
    }
    return !fieldValue.includes(value);
  }
  
  return false;
}

/**
 * Apply ConvexQueryFilter ke array of records (client-side filtering)
 * 
 * Useful untuk:
 * 1. Preview filtering sebelum query ke backend
 * 2. Client-side filtering untuk cached data
 * 3. Testing filter logic
 */
export function applyQueryFilter<T extends Record<string, any>>(
  records: T[],
  filter: ConvexQueryFilter
): T[] {
  if (!filter || filter.filters.length === 0) {
    return records;
  }
  
  return records.filter(record => {
    const results = filter.filters.map(f => {
      if ('operation' in f) {
        // Nested filter group
        return applyQueryFilter([record], f as ConvexQueryFilter).length > 0;
      } else {
        // Single filter expression
        return applyFilterExpression(record, f as FilterExpression);
      }
    });
    
    // Apply AND/OR operation
    if (filter.operation === 'AND') {
      return results.every(r => r);
    } else {
      return results.some(r => r);
    }
  });
}

/**
 * Build Convex query filter for server-side filtering
 * 
 * ⚠️ NOTE: Convex tidak support complex filtering di query builder.
 * Kita perlu filter di client-side setelah fetch, atau gunakan index-based filtering.
 * 
 * This function converts our filter format to a format that can be:
 * 1. Used with Convex indexes (for simple equality filters)
 * 2. Applied client-side after fetching (for complex filters)
 * 
 * @example Simple indexed filter
 * ```ts
 * // For filters like: status equals "active"
 * const filter = { field: "status", operator: "equals", value: "active" };
 * 
 * // Use with Convex index:
 * query = ctx.db.query("records")
 *   .withIndex("by_status", q => q.eq("status", "active"));
 * ```
 * 
 * @example Complex filter (client-side)
 * ```ts
 * // For complex filters, fetch all then filter client-side
 * const allRecords = await query.collect();
 * const filtered = applyQueryFilter(allRecords, filter);
 * ```
 */
export function buildConvexQueryArgs(filter: ConvexQueryFilter): {
  /**
   * Simple equality filters yang bisa digunakan dengan Convex indexes
   */
  indexableFilters: Array<{ field: string; value: any }>;
  
  /**
   * Complex filters yang harus di-apply client-side
   */
  clientFilters: ConvexQueryFilter | null;
  
  /**
   * Apakah ada filters yang perlu client-side processing
   */
  needsClientFiltering: boolean;
} {
  const indexableFilters: Array<{ field: string; value: any }> = [];
  const complexFilters: FilterExpression[] = [];
  
  // Analyze filters
  filter.filters.forEach(f => {
    if ('operation' in f) {
      // Nested group = always complex
      complexFilters.push(f as any);
    } else {
      const expr = f as FilterExpression;
      
      // Simple equality can use index
      if (expr.operator === 'equals' && !Array.isArray(expr.value)) {
        indexableFilters.push({
          field: expr.field,
          value: expr.value,
        });
      } else {
        // All other operators need client-side filtering
        complexFilters.push(expr);
      }
    }
  });
  
  return {
    indexableFilters,
    clientFilters: complexFilters.length > 0 ? {
      operation: filter.operation,
      filters: complexFilters,
    } : null,
    needsClientFiltering: complexFilters.length > 0,
  };
}

/**
 * Helper untuk generate index-based Convex query args
 * 
 * @example
 * ```ts
 * const args = getIndexFilters(filter);
 * // Returns: { status: "active", priority: "high" }
 * 
 * // Use in Convex query:
 * export const list = query({
 *   args: {
 *     workspaceId: v.id("workspaces"),
 *     ...Object.fromEntries(
 *       Object.keys(getIndexFilters({})).map(key => [key, v.optional(v.any())])
 *     ),
 *   },
 *   handler: async (ctx, args) => {
 *     let query = ctx.db.query("records")
 *       .withIndex("by_workspace", q => q.eq("workspaceId", args.workspaceId));
 *     
 *     // Apply indexed filters
 *     if (args.status) {
 *       query = query.filter(q => q.eq(q.field("status"), args.status));
 *     }
 *     
 *     return await query.collect();
 *   },
 * });
 * ```
 */
export function getIndexFilters(filter: ConvexQueryFilter): Record<string, any> {
  const { indexableFilters } = buildConvexQueryArgs(filter);
  
  return Object.fromEntries(
    indexableFilters.map(f => [f.field, f.value])
  );
}

/**
 * Complete filter application utility
 * 
 * Applies both index-based and client-side filtering automatically.
 * 
 * @example
 * ```ts
 * export const listRecords = query({
 *   args: {
 *     workspaceId: v.id("workspaces"),
 *     databaseId: v.id("databases"),
 *     filter: v.optional(v.any()),
 *   },
 *   handler: async (ctx, args) => {
 *     // 1. Base query
 *     let records = await ctx.db
 *       .query("records")
 *       .withIndex("by_workspace_and_database", q =>
 *         q.eq("workspaceId", args.workspaceId)
 *          .eq("databaseId", args.databaseId)
 *       )
 *       .collect();
 *     
 *     // 2. Apply filters
 *     if (args.filter) {
 *       records = applyConvexFilters(records, args.filter);
 *     }
 *     
 *     return records;
 *   },
 * });
 * ```
 */
export function applyConvexFilters<T extends Record<string, any>>(
  records: T[],
  filter: ConvexQueryFilter
): T[] {
  if (!filter || filter.filters.length === 0) {
    return records;
  }
  
  return applyQueryFilter(records, filter);
}
