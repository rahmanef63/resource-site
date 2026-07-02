/**
 * Universal Database Filters - Type Definitions
 * 
 * Centralized filter system untuk Universal Database dengan integrasi Convex.
 * Mendukung semua property types dengan cara yang scalable dan customizable.
 * 
 * @module frontend/slices/database/filters/types
 */

import type { Property, PropertyType } from '@/frontend/shared/foundation/types/universal-database';
import type { Filter, FilterFieldConfig, FilterOperator } from '@/components/ui/filters';

/**
 * Filter configuration untuk database view
 */
export interface DatabaseFilterConfig {
  /** Active filters */
  filters: Filter[];
  /** Match mode - all atau any */
  matchMode: 'all' | 'any';
}

/**
 * Filter query result untuk Convex
 */
export interface FilterQuery {
  /** Field name atau property ID */
  field: string;
  /** Operator (is, contains, etc) */
  operator: string;
  /** Values untuk comparison */
  values: unknown[];
}

/**
 * Property-specific filter operators
 * Mapping dari PropertyType ke operators yang supported
 */
export const PROPERTY_TYPE_OPERATORS: Record<PropertyType, FilterOperator[]> = {
  // Text-based types
  text: [
    { value: 'contains', label: 'contains' },
    { value: 'notContains', label: 'does not contain' },
    { value: 'is', label: 'is' },
    { value: 'isNot', label: 'is not' },
    { value: 'startsWith', label: 'starts with' },
    { value: 'endsWith', label: 'ends with' },
    { value: 'empty', label: 'is empty' },
    { value: 'notEmpty', label: 'is not empty' },
  ],

  rich_text: [
    { value: 'contains', label: 'contains' },
    { value: 'notContains', label: 'does not contain' },
    { value: 'is', label: 'is' },
    { value: 'isNot', label: 'is not' },
    { value: 'startsWith', label: 'starts with' },
    { value: 'endsWith', label: 'ends with' },
    { value: 'empty', label: 'is empty' },
    { value: 'notEmpty', label: 'is not empty' },
  ],
  
  title: [
    { value: 'contains', label: 'contains' },
    { value: 'notContains', label: 'does not contain' },
    { value: 'is', label: 'is' },
    { value: 'isNot', label: 'is not' },
    { value: 'startsWith', label: 'starts with' },
    { value: 'endsWith', label: 'ends with' },
    { value: 'empty', label: 'is empty' },
    { value: 'notEmpty', label: 'is not empty' },
  ],
  
  // Number type
  number: [
    { value: 'equals', label: 'equals' },
    { value: 'notEquals', label: 'not equals' },
    { value: 'greaterThan', label: 'greater than' },
    { value: 'lessThan', label: 'less than' },
    { value: 'between', label: 'between' },
    { value: 'notBetween', label: 'not between' },
    { value: 'empty', label: 'is empty' },
    { value: 'notEmpty', label: 'is not empty' },
  ],
  
  // Select types
  select: [
    { value: 'is', label: 'is' },
    { value: 'isNot', label: 'is not' },
    { value: 'isAnyOf', label: 'is any of', supportsMultiple: true },
    { value: 'isNotAnyOf', label: 'is not any of', supportsMultiple: true },
    { value: 'empty', label: 'is empty' },
    { value: 'notEmpty', label: 'is not empty' },
  ],
  
  multi_select: [
    { value: 'includesAnyOf', label: 'includes any of', supportsMultiple: true },
    { value: 'includesAllOf', label: 'includes all of', supportsMultiple: true },
    { value: 'excludes', label: 'excludes', supportsMultiple: true },
    { value: 'empty', label: 'is empty' },
    { value: 'notEmpty', label: 'is not empty' },
  ],
  
  // Date types
  date: [
    { value: 'is', label: 'is' },
    { value: 'before', label: 'before' },
    { value: 'after', label: 'after' },
    { value: 'between', label: 'between' },
    { value: 'empty', label: 'is empty' },
    { value: 'notEmpty', label: 'is not empty' },
  ],
  
  // Boolean type
  checkbox: [
    { value: 'is', label: 'is' },
  ],
  
  // Email type
  email: [
    { value: 'contains', label: 'contains' },
    { value: 'notContains', label: 'does not contain' },
    { value: 'is', label: 'is' },
    { value: 'isNot', label: 'is not' },
    { value: 'empty', label: 'is empty' },
    { value: 'notEmpty', label: 'is not empty' },
  ],
  
  // URL type
  url: [
    { value: 'contains', label: 'contains' },
    { value: 'notContains', label: 'does not contain' },
    { value: 'is', label: 'is' },
    { value: 'isNot', label: 'is not' },
    { value: 'empty', label: 'is empty' },
    { value: 'notEmpty', label: 'is not empty' },
  ],
  
  // Phone type
  phone: [
    { value: 'contains', label: 'contains' },
    { value: 'is', label: 'is' },
    { value: 'isNot', label: 'is not' },
    { value: 'empty', label: 'is empty' },
    { value: 'notEmpty', label: 'is not empty' },
  ],
  
  // Formula type (read-only, limited operators)
  formula: [
    { value: 'empty', label: 'is empty' },
    { value: 'notEmpty', label: 'is not empty' },
  ],
  
  // Rollup type (read-only, limited operators)
  rollup: [
    { value: 'empty', label: 'is empty' },
    { value: 'notEmpty', label: 'is not empty' },
  ],
  
  // Created/Modified time
  created_time: [
    { value: 'is', label: 'is' },
    { value: 'before', label: 'before' },
    { value: 'after', label: 'after' },
    { value: 'between', label: 'between' },
  ],
  
  last_edited_time: [
    { value: 'is', label: 'is' },
    { value: 'before', label: 'before' },
    { value: 'after', label: 'after' },
    { value: 'between', label: 'between' },
  ],
  
  // User types
  created_by: [
    { value: 'is', label: 'is' },
    { value: 'isAnyOf', label: 'is any of', supportsMultiple: true },
    { value: 'empty', label: 'is empty' },
    { value: 'notEmpty', label: 'is not empty' },
  ],
  
  last_edited_by: [
    { value: 'is', label: 'is' },
    { value: 'isAnyOf', label: 'is any of', supportsMultiple: true },
    { value: 'empty', label: 'is empty' },
    { value: 'notEmpty', label: 'is not empty' },
  ],
  
  // Files type
  files: [
    { value: 'empty', label: 'is empty' },
    { value: 'notEmpty', label: 'is not empty' },
  ],
  
  // Relation type
  relation: [
    { value: 'contains', label: 'contains' },
    { value: 'notContains', label: 'does not contain' },
    { value: 'empty', label: 'is empty' },
    { value: 'notEmpty', label: 'is not empty' },
  ],
  
  // Status type (similar to select)
  status: [
    { value: 'is', label: 'is' },
    { value: 'isNot', label: 'is not' },
    { value: 'isAnyOf', label: 'is any of', supportsMultiple: true },
    { value: 'isNotAnyOf', label: 'is not any of', supportsMultiple: true },
    { value: 'empty', label: 'is empty' },
    { value: 'notEmpty', label: 'is not empty' },
  ],
  
  // People type (similar to multi-select)
  people: [
    { value: 'contains', label: 'contains' },
    { value: 'notContains', label: 'does not contain' },
    { value: 'empty', label: 'is empty' },
    { value: 'notEmpty', label: 'is not empty' },
  ],
  
  // Button type (no filters)
  button: [],
  
  // Unique ID type
  unique_id: [
    { value: 'is', label: 'is' },
    { value: 'contains', label: 'contains' },
    { value: 'startsWith', label: 'starts with' },
    { value: 'empty', label: 'is empty' },
    { value: 'notEmpty', label: 'is not empty' },
  ],
  
  // Place type (location)
  place: [
    { value: 'contains', label: 'contains' },
    { value: 'empty', label: 'is empty' },
    { value: 'notEmpty', label: 'is not empty' },
  ],
};

/**
 * Map PropertyType ke filter field type
 */
export const PROPERTY_TYPE_TO_FILTER_TYPE: Record<PropertyType, FilterFieldConfig['type']> = {
  text: 'text',
  rich_text: 'text',
  title: 'text',
  number: 'number',
  select: 'select',
  multi_select: 'multiselect',
  date: 'date',
  checkbox: 'boolean',
  email: 'email',
  url: 'url',
  phone: 'tel',
  formula: 'text',
  rollup: 'text',
  created_time: 'datetime',
  last_edited_time: 'datetime',
  created_by: 'select',
  last_edited_by: 'select',
  files: 'custom',
  relation: 'select',
  status: 'select',
  people: 'multiselect',
  button: 'custom',
  unique_id: 'text',
  place: 'text',
};

/**
 * Default operators untuk setiap property type
 */
export const DEFAULT_OPERATORS: Record<PropertyType, string> = {
  text: 'contains',
  rich_text: 'contains',
  title: 'contains',
  number: 'equals',
  select: 'is',
  multi_select: 'includesAnyOf',
  date: 'is',
  checkbox: 'is',
  email: 'contains',
  url: 'contains',
  phone: 'contains',
  formula: 'notEmpty',
  rollup: 'notEmpty',
  created_time: 'is',
  last_edited_time: 'is',
  created_by: 'is',
  last_edited_by: 'is',
  files: 'notEmpty',
  relation: 'contains',
  status: 'is',
  people: 'contains',
  button: 'empty',
  unique_id: 'is',
  place: 'contains',
};
