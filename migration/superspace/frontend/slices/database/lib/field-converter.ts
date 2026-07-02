/**
 * Converter: V1 DatabaseField → V2 Universal Database Property
 * 
 * Converts legacy DatabaseField (from dbFields table) to new Property interface
 * for use with Universal Database Property Registry system.
 */

import type { DatabaseField } from '../types';
import type { Property } from '@/frontend/shared/foundation/types/universal-database';
import type { PropertyOptions, SelectOptions, NumberOptions } from '@/frontend/shared/foundation/types/property-options';

/**
 * Map V1 field types to V2 property types
 */
const FIELD_TYPE_MAPPING: Record<string, Property['type']> = {
  'text': 'text',
  'number': 'number',
  'select': 'select',
  'multiSelect': 'multi_select',
  'date': 'date',
  'person': 'people',
  'files': 'files',
  'checkbox': 'checkbox',
  'url': 'url',
  'email': 'email',
  'phone': 'phone',
  'formula': 'formula',
  'relation': 'relation',
  'rollup': 'rollup',
};

/**
 * Convert V1 DatabaseField.options to V2 PropertyOptions
 */
function convertFieldOptions(field: DatabaseField): PropertyOptions | undefined {
  if (!field.options) return undefined;

  const { selectOptions, numberFormat, dateFormat, formula } = field.options;

  // Convert select options
  if (selectOptions && selectOptions.length > 0 && (field.type === 'select' || field.type === 'multiSelect')) {
    const choices = selectOptions.map(opt => ({
      id: opt.id,
      name: opt.name,
      color: opt.color,
    }));

    const selectOpts: SelectOptions = {
      choices,
      allowCreate: true,
    };

    return selectOpts;
  }

  // Convert number format
  if (numberFormat && field.type === 'number') {
    const numberOpts: NumberOptions = {
      format: numberFormat === 'currency' ? 'currency' : 
              numberFormat === 'percent' ? 'percent' : 'number',
      decimals: 2,
    };

    return numberOpts;
  }

  // Other options can be added here
  // Date, Formula, Relation, etc.

  return undefined;
}

/**
 * Convert V1 DatabaseField to V2 Property
 */
export function convertFieldToProperty(field: DatabaseField): Property {
  const v2Type = FIELD_TYPE_MAPPING[field.type] || 'text';

  // Property interface doesn't have _id, so we use it for key
  const property: Property = {
    key: String(field._id),
    name: (field as any).label || (field as any).name || String(field._id),
    type: v2Type,
    isRequired: (field as any).isRequired ?? (field as any).required ?? false,
    description: (field as any).description,
    options: convertFieldOptions(field),
  };

  return property;
}

/**
 * Convert array of V1 DatabaseFields to V2 Properties
 */
export function convertFieldsToProperties(fields: DatabaseField[]): Property[] {
  return fields.map(convertFieldToProperty);
}

/**
 * Check if a field-like object is already a V2 Property
 */
export function isProperty(obj: any): obj is Property {
  return obj && 'key' in obj && 'required' in obj && typeof obj.type === 'string';
}
