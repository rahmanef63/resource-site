import { List } from "lucide-react";
import type { PropertyConfig } from '../../registry/types';
import { SelectRenderer } from './SelectRenderer';
import { SelectEditor } from './SelectEditor';

export const selectPropertyConfig: PropertyConfig = {
  // Identification
  type: 'select',
  label: 'Select',
  description: 'Single option from a list',
  icon: List,

  // Capabilities
  supportsOptions: true,
  supportsRequired: false,
  supportsUnique: false,
  supportsDefault: true,
  isAuto: false,
  isEditable: true,

  // Components
  Renderer: SelectRenderer,
  Editor: SelectEditor,

  // Validation
  validate: (value) => {
    if (value === null || value === undefined) return null;
    if (typeof value !== 'string') {
      return 'Select value must be text';
    }
    return null;
  },

  // Formatting
  format: (value) => {
    return value ? String(value) : '';
  },

  // Metadata
  category: 'core',
  version: '2.0',
  tags: ['select', 'option', 'dropdown'],
};


export default selectPropertyConfig;
