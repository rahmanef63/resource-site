import { Binary } from "lucide-react";
import type { PropertyConfig } from '../../registry/types';
import { FormulaRenderer } from './FormulaRenderer';
import { FormulaEditor } from './FormulaEditor';

export const formulaPropertyConfig: PropertyConfig = {
  // Identification
  type: 'formula',
  label: 'Formula',
  description: 'Computed value based on other properties',
  icon: Binary,

  // Capabilities
  supportsOptions: true, // Need to specify formula expression
  supportsRequired: false,
  supportsUnique: false,
  supportsDefault: false,
  isAuto: true, // Computed automatically
  isEditable: false, // Read-only

  // Components
  Renderer: FormulaRenderer,
  Editor: FormulaEditor,

  // Validation
  validate: (value) => {
    // Formula values can be any type
    return null;
  },

  // Formatting
  format: (value) => {
    if (value === null || value === undefined) return '';
    if (typeof value === 'number') {
      return new Intl.NumberFormat('en-US').format(value);
    }
    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No';
    }
    return String(value);
  },

  // Metadata
  category: 'extended',
  version: '2.0',
  tags: ['formula', 'computed', 'expression'],
};


export default formulaPropertyConfig;
