import { Hash } from "lucide-react";
import type { PropertyConfig } from '../../registry/types';
import { NumberRenderer } from './NumberRenderer';
import { NumberEditor } from './NumberEditor';

export const numberPropertyConfig: PropertyConfig = {
  // Identification
  type: 'number',
  label: 'Number',
  description: 'Numeric value with formatting options',
  icon: Hash,

  // Capabilities
  supportsOptions: false,
  supportsRequired: false,
  supportsUnique: false,
  supportsDefault: true,
  isAuto: false,
  isEditable: true,

  // Components
  Renderer: NumberRenderer,
  Editor: NumberEditor,

  // Validation
  validate: (value) => {
    if (value === null || value === undefined) return null;
    const num = Number(value);
    if (isNaN(num) || !isFinite(num)) {
      return 'Must be a valid number';
    }
    return null;
  },

  // Formatting
  format: (value) => {
    if (value === null || value === undefined) return '';
    const num = Number(value);
    if (isNaN(num)) return '';
    return new Intl.NumberFormat('en-US', {
      maximumFractionDigits: 10,
    }).format(num);
  },

  // Metadata
  category: 'core',
  version: '2.0',
  tags: ['number', 'numeric', 'integer', 'decimal'],
};


export default numberPropertyConfig;
