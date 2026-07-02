import { ListChecks } from "lucide-react";
import type { PropertyConfig } from '../../registry/types';
import { MultiSelectRenderer } from './MultiSelectRenderer';
import { MultiSelectEditor } from './MultiSelectEditor';

export const multiSelectPropertyConfig: PropertyConfig = {
  // Identification
  type: 'multi_select',
  label: 'Multi-Select',
  description: 'Multiple options from a list',
  icon: ListChecks,

  // Capabilities
  supportsOptions: true,
  supportsRequired: false,
  supportsUnique: false,
  supportsDefault: true,
  isAuto: false,
  isEditable: true,

  // Components
  Renderer: MultiSelectRenderer,
  Editor: MultiSelectEditor,

  // Validation
  validate: (value) => {
    if (value === null || value === undefined) return null;
    if (!Array.isArray(value) && typeof value !== 'string') {
      return 'Multi-select must be an array or comma-separated string';
    }
    return null;
  },

  // Formatting
  format: (value) => {
    if (!value) return '';
    if (Array.isArray(value)) {
      return value.join(', ');
    }
    return String(value);
  },

  // Metadata
  category: 'core',
  version: '2.0',
  tags: ['multi-select', 'options', 'array'],
};


export default multiSelectPropertyConfig;
