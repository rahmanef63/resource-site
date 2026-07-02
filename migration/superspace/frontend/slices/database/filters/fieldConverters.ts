/**
 * Universal Database Filters - Field Converters
 * 
 * Utilities untuk mengkonversi Property menjadi FilterFieldConfig secara dynamic.
 * Mendukung semua property types dengan options yang di-generate dari database.
 * 
 * @module frontend/slices/database/filters/fieldConverters
 */

import type { Property } from '@/frontend/shared/foundation/types/universal-database';
import type { FilterFieldConfig, FilterOption } from '@/components/ui/filters';
import type { SelectOptions } from '@/frontend/shared/foundation/types/property-options';
import { 
  PROPERTY_TYPE_OPERATORS, 
  PROPERTY_TYPE_TO_FILTER_TYPE,
  DEFAULT_OPERATORS 
} from './types';

/**
 * Convert Property to FilterFieldConfig
 * Automatically generates filter field configuration dari property definition
 */
export function propertyToFilterField(property: Property): FilterFieldConfig {
  const baseConfig: FilterFieldConfig = {
    key: property.key,
    label: property.name,
    type: PROPERTY_TYPE_TO_FILTER_TYPE[property.type],
    operators: PROPERTY_TYPE_OPERATORS[property.type] || [],
    defaultOperator: DEFAULT_OPERATORS[property.type],
  };

  // Add type-specific configurations
  switch (property.type) {
    case 'select':
    case 'multi_select':
      return {
        ...baseConfig,
        options: getSelectOptions(property),
        searchable: true,
        maxSelections: property.type === 'multi_select' ? undefined : 1,
      };

    case 'number':
      return {
        ...baseConfig,
        min: (property.options as any)?.min,
        max: (property.options as any)?.max,
        step: 1,
        prefix: (property.options as any)?.format === 'currency' ? '$' : undefined,
        suffix: (property.options as any)?.format === 'percent' ? '%' : undefined,
      };

    case 'date':
    case 'created_time':
    case 'last_edited_time':
      return {
        ...baseConfig,
        // Date-specific config bisa ditambahkan di sini
      };

    case 'checkbox':
      return {
        ...baseConfig,
        onLabel: 'Checked',
        offLabel: 'Unchecked',
      };

    case 'email':
      return {
        ...baseConfig,
        pattern: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$',
        validation: (value: unknown) => {
          if (typeof value !== 'string') return false;
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
        },
      };

    case 'url':
      return {
        ...baseConfig,
        pattern: '^https?://.+',
        validation: (value: unknown) => {
          if (typeof value !== 'string') return false;
          try {
            new URL(value);
            return true;
          } catch {
            return false;
          }
        },
      };

    case 'phone':
      return {
        ...baseConfig,
        pattern: '^[\\d\\s\\-\\+\\(\\)]+$',
      };

    case 'text':
    case 'title':
      return {
        ...baseConfig,
        placeholder: `Enter ${property.name.toLowerCase()}...`,
      };

    default:
      return baseConfig;
  }
}

/**
 * Get options untuk select/multi-select fields
 */
export function getSelectOptions(property: Property): FilterOption[] {
  const selectOptions = property.options as SelectOptions | undefined;
  
  if (!selectOptions?.choices || selectOptions.choices.length === 0) {
    return [];
  }

  return selectOptions.choices.map(choice => ({
    value: choice.name,
    label: choice.name,
    metadata: {
      color: choice.color,
      id: choice.id,
      icon: choice.icon,
    },
  }));
}

/**
 * Convert array of Properties to FilterFieldsConfig
 * Groups properties by type untuk better organization
 */
export function propertiesToFilterFields(
  properties: Property[],
  options?: {
    groupByType?: boolean;
    excludeTypes?: Property['type'][];
    includeSystemFields?: boolean;
  }
): FilterFieldConfig[] {
  const {
    groupByType = false,
    excludeTypes = [],
    includeSystemFields = true,
  } = options || {};

  // Filter properties
  let filteredProperties = properties.filter(prop => {
    // Exclude specified types
    if (excludeTypes.includes(prop.type)) return false;
    
    // System fields filter
    if (!includeSystemFields) {
      const systemFields = ['created_time', 'last_edited_time', 'created_by', 'last_edited_by'];
      if (systemFields.includes(prop.type)) return false;
    }
    
    return true;
  });

  // Convert to filter fields
  const filterFields = filteredProperties.map(propertyToFilterField);

  // Group by type if requested
  if (groupByType) {
    return groupFilterFieldsByType(filterFields);
  }

  return filterFields;
}

/**
 * Group filter fields by property type
 */
function groupFilterFieldsByType(fields: FilterFieldConfig[]): FilterFieldConfig[] {
  const grouped = fields.reduce((acc, field) => {
    const type = field.type || 'other';
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(field);
    return acc;
  }, {} as Record<string, FilterFieldConfig[]>);

  // Convert to grouped format
  const typeLabels: Record<string, string> = {
    text: 'Text Fields',
    number: 'Number Fields',
    select: 'Select Fields',
    multiselect: 'Multi-Select Fields',
    date: 'Date Fields',
    datetime: 'Date & Time Fields',
    boolean: 'Checkbox Fields',
    email: 'Email Fields',
    url: 'URL Fields',
    tel: 'Phone Fields',
    custom: 'Other Fields',
  };

  return Object.entries(grouped).flatMap(([type, fields]) => [
    {
      key: `separator-${type}`,
      type: 'separator' as const,
      label: typeLabels[type] || `${type} Fields`,
    },
    ...fields,
  ]);
}

/**
 * Get filter field by property key
 */
export function getFilterFieldByPropertyKey(
  properties: Property[],
  propertyKey: string
): FilterFieldConfig | undefined {
  const property = properties.find(p => p.key === propertyKey);
  if (!property) return undefined;
  
  return propertyToFilterField(property);
}

/**
 * Batch convert multiple property keys to filter fields
 */
export function getFilterFieldsByPropertyKeys(
  properties: Property[],
  propertyKeys: string[]
): FilterFieldConfig[] {
  return propertyKeys
    .map(key => getFilterFieldByPropertyKey(properties, key))
    .filter((field): field is FilterFieldConfig => field !== undefined);
}
