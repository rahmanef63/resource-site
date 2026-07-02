import type { PropertyType } from '@/frontend/shared/foundation/types/universal-database';

/**
 * Filter types from @reui/filters
 */
export interface Filter {
  key: string;
  operator: string;
  value: any;
}

export interface FilterGroup {
  operation: 'AND' | 'OR';
  filters: Filter[];
  groups?: FilterGroup[];
}

/**
 * Convex filter expression type
 */
export interface ConvexFilterExpression {
  field: string;
  operator: string;
  value: any;
  propertyType: PropertyType;
}

/**
 * Convex query filter type
 */
export interface ConvexQueryFilter {
  operation: 'AND' | 'OR';
  filters: (ConvexFilterExpression | ConvexQueryFilter)[];
}

/**
 * Convert operator ke Convex operator
 */
function convertOperator(operator: string, propertyType: PropertyType): string {
  // Text operators
  if (operator === 'contains') return 'contains';
  if (operator === 'notContains') return 'notContains';
  if (operator === 'startsWith') return 'startsWith';
  if (operator === 'endsWith') return 'endsWith';
  if (operator === 'is') return 'equals';
  if (operator === 'isNot') return 'notEquals';
  
  // Number operators
  if (operator === 'equals') return 'equals';
  if (operator === 'notEquals') return 'notEquals';
  if (operator === 'greaterThan') return 'greaterThan';
  if (operator === 'greaterThanOrEquals') return 'greaterThanOrEquals';
  if (operator === 'lessThan') return 'lessThan';
  if (operator === 'lessThanOrEquals') return 'lessThanOrEquals';
  if (operator === 'between') return 'between';
  
  // Array operators
  if (operator === 'includesAnyOf') return 'includesAnyOf';
  if (operator === 'includesAllOf') return 'includesAllOf';
  if (operator === 'excludes') return 'excludes';
  if (operator === 'isAnyOf') return 'includesAnyOf';
  if (operator === 'isNotAnyOf') return 'excludes';
  
  // Empty operators
  if (operator === 'empty') return 'isEmpty';
  if (operator === 'notEmpty') return 'isNotEmpty';
  
  // Date operators
  if (operator === 'before') return 'lessThan';
  if (operator === 'after') return 'greaterThan';
  if (operator === 'onOrBefore') return 'lessThanOrEquals';
  if (operator === 'onOrAfter') return 'greaterThanOrEquals';
  if (operator === 'dateIs') return 'equals';
  if (operator === 'dateIsNot') return 'notEquals';
  
  // Boolean operators
  if (operator === 'checked') return 'equals';
  if (operator === 'unchecked') return 'equals';
  
  // Default
  return operator;
}

/**
 * Convert filter value berdasarkan property type
 */
function convertValue(value: any, propertyType: PropertyType, operator: string): any {
  // Handle empty operators
  if (operator === 'empty' || operator === 'notEmpty') {
    return null;
  }
  
  // Handle boolean
  if (propertyType === 'checkbox') {
    if (operator === 'checked') return true;
    if (operator === 'unchecked') return false;
    return Boolean(value);
  }
  
  // Handle number
  if (propertyType === 'number') {
    if (operator === 'between' && Array.isArray(value)) {
      return value.map(v => Number(v));
    }
    return Number(value);
  }
  
  // Handle date
  if (propertyType === 'date' || propertyType === 'created_time' || propertyType === 'last_edited_time') {
    if (operator === 'between' && Array.isArray(value)) {
      return value.map(v => new Date(v).getTime());
    }
    return new Date(value).getTime();
  }
  
  // Handle multi-value operators
  if (operator === 'includesAnyOf' || operator === 'includesAllOf' || operator === 'excludes' || 
      operator === 'isAnyOf' || operator === 'isNotAnyOf') {
    return Array.isArray(value) ? value : [value];
  }
  
  // Handle text - ensure string
  if (propertyType === 'text' || propertyType === 'title' || propertyType === 'email' || 
      propertyType === 'url' || propertyType === 'phone' || propertyType === 'unique_id' || 
      propertyType === 'place') {
    return String(value);
  }
  
  // Default
  return value;
}

/**
 * Convert single filter ke Convex expression
 */
function filterToExpression(
  filter: Filter,
  propertyType: PropertyType
): ConvexFilterExpression {
  return {
    field: filter.key,
    operator: convertOperator(filter.operator, propertyType),
    value: convertValue(filter.value, propertyType, filter.operator),
    propertyType,
  };
}

/**
 * Convert FilterGroup ke ConvexQueryFilter
 */
function filterGroupToQuery(
  filterGroup: FilterGroup,
  propertyTypes: Record<string, PropertyType>
): ConvexQueryFilter {
  const filters = filterGroup.filters.map(filter => {
    // Get property type
    const propertyType = propertyTypes[filter.key];
    if (!propertyType) {
      console.warn(`Property type not found for key: ${filter.key}`);
      return null;
    }
    
    return filterToExpression(filter, propertyType);
  }).filter(Boolean) as ConvexFilterExpression[];
  
  return {
    operation: filterGroup.operation || 'AND',
    filters,
  };
}

/**
 * Convert nested FilterGroup (dengan sub-groups) ke ConvexQueryFilter
 */
function nestedFilterGroupToQuery(
  filterGroup: FilterGroup,
  propertyTypes: Record<string, PropertyType>
): ConvexQueryFilter {
  const filters: (ConvexFilterExpression | ConvexQueryFilter)[] = [];
  
  // Process direct filters
  filterGroup.filters.forEach(filter => {
    const propertyType = propertyTypes[filter.key];
    if (!propertyType) {
      console.warn(`Property type not found for key: ${filter.key}`);
      return;
    }
    
    filters.push(filterToExpression(filter, propertyType));
  });
  
  // Process sub-groups recursively
  if (filterGroup.groups && filterGroup.groups.length > 0) {
    filterGroup.groups.forEach(subGroup => {
      filters.push(nestedFilterGroupToQuery(subGroup, propertyTypes));
    });
  }
  
  return {
    operation: filterGroup.operation || 'AND',
    filters,
  };
}

/**
 * Build Convex query dari Filter array
 */
export function buildConvexQuery(
  filters: Filter[],
  propertyTypes: Record<string, PropertyType>,
  operation: 'AND' | 'OR' = 'AND'
): ConvexQueryFilter {
  const expressions = filters
    .map(filter => {
      const propertyType = propertyTypes[filter.key];
      if (!propertyType) {
        console.warn(`Property type not found for key: ${filter.key}`);
        return null;
      }
      
      return filterToExpression(filter, propertyType);
    })
    .filter(Boolean) as ConvexFilterExpression[];
  
  return {
    operation,
    filters: expressions,
  };
}

/**
 * Build Convex query dari FilterGroup
 */
export function buildConvexQueryFromGroup(
  filterGroup: FilterGroup,
  propertyTypes: Record<string, PropertyType>
): ConvexQueryFilter {
  // Handle nested groups
  if (filterGroup.groups && filterGroup.groups.length > 0) {
    return nestedFilterGroupToQuery(filterGroup, propertyTypes);
  }
  
  // Handle simple group
  return filterGroupToQuery(filterGroup, propertyTypes);
}

/**
 * Apply ConvexFilterExpression ke data
 * Untuk client-side filtering
 */
export function applyFilterExpression(
  data: any,
  expression: ConvexFilterExpression
): boolean {
  const fieldValue = data[expression.field];
  const { operator, value } = expression;
  
  // Empty checks
  if (operator === 'isEmpty') {
    return fieldValue === null || fieldValue === undefined || fieldValue === '';
  }
  if (operator === 'isNotEmpty') {
    return fieldValue !== null && fieldValue !== undefined && fieldValue !== '';
  }
  
  // Text operators
  if (operator === 'contains') {
    return String(fieldValue).toLowerCase().includes(String(value).toLowerCase());
  }
  if (operator === 'notContains') {
    return !String(fieldValue).toLowerCase().includes(String(value).toLowerCase());
  }
  if (operator === 'startsWith') {
    return String(fieldValue).toLowerCase().startsWith(String(value).toLowerCase());
  }
  if (operator === 'endsWith') {
    return String(fieldValue).toLowerCase().endsWith(String(value).toLowerCase());
  }
  
  // Equality operators
  if (operator === 'equals') {
    return fieldValue === value;
  }
  if (operator === 'notEquals') {
    return fieldValue !== value;
  }
  
  // Number operators
  if (operator === 'greaterThan') {
    return Number(fieldValue) > Number(value);
  }
  if (operator === 'greaterThanOrEquals') {
    return Number(fieldValue) >= Number(value);
  }
  if (operator === 'lessThan') {
    return Number(fieldValue) < Number(value);
  }
  if (operator === 'lessThanOrEquals') {
    return Number(fieldValue) <= Number(value);
  }
  if (operator === 'between' && Array.isArray(value)) {
    const numValue = Number(fieldValue);
    return numValue >= Number(value[0]) && numValue <= Number(value[1]);
  }
  
  // Array operators
  if (operator === 'includesAnyOf') {
    if (!Array.isArray(fieldValue)) return false;
    return Array.isArray(value) && value.some(v => fieldValue.includes(v));
  }
  if (operator === 'includesAllOf') {
    if (!Array.isArray(fieldValue)) return false;
    return Array.isArray(value) && value.every(v => fieldValue.includes(v));
  }
  if (operator === 'excludes') {
    if (!Array.isArray(fieldValue)) return false;
    return Array.isArray(value) && !value.some(v => fieldValue.includes(v));
  }
  
  // Default
  return false;
}

/**
 * Apply ConvexQueryFilter ke data
 * Untuk client-side filtering dengan AND/OR logic
 */
export function applyQueryFilter(
  data: any,
  query: ConvexQueryFilter
): boolean {
  if (query.operation === 'AND') {
    return query.filters.every(filter => {
      if ('operation' in filter) {
        // Nested query
        return applyQueryFilter(data, filter as ConvexQueryFilter);
      } else {
        // Expression
        return applyFilterExpression(data, filter as ConvexFilterExpression);
      }
    });
  } else {
    // OR
    return query.filters.some(filter => {
      if ('operation' in filter) {
        // Nested query
        return applyQueryFilter(data, filter as ConvexQueryFilter);
      } else {
        // Expression
        return applyFilterExpression(data, filter as ConvexFilterExpression);
      }
    });
  }
}

/**
 * Convert ConvexQueryFilter ke Convex query string
 * Untuk debugging dan logging
 */
export function queryToString(query: ConvexQueryFilter, indent = 0): string {
  const spaces = '  '.repeat(indent);
  let result = `${spaces}${query.operation} (\n`;
  
  query.filters.forEach((filter, index) => {
    if ('operation' in filter) {
      // Nested query
      result += queryToString(filter as ConvexQueryFilter, indent + 1);
    } else {
      // Expression
      const expr = filter as ConvexFilterExpression;
      result += `${spaces}  ${expr.field} ${expr.operator} ${JSON.stringify(expr.value)}`;
    }
    
    if (index < query.filters.length - 1) {
      result += ',';
    }
    result += '\n';
  });
  
  result += `${spaces})`;
  return result;
}
