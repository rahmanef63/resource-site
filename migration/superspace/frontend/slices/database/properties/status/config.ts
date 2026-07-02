import { Target } from "lucide-react";
import type { PropertyConfig } from '../../registry/types';
import { StatusRenderer } from './StatusRenderer';
import { StatusEditor } from './StatusEditor';

export const statusPropertyConfig: PropertyConfig = {
  // Identification
  type: 'status',
  label: 'Status',
  description: 'Status with grouped options and color coding',
  icon: Target,

  // Capabilities
  supportsOptions: true, // Can define custom status groups
  supportsRequired: false,
  supportsUnique: false,
  supportsDefault: true,
  isAuto: false,
  isEditable: true,

  // Components
  Renderer: StatusRenderer,
  Editor: StatusEditor,

  // Validation
  validate: (value) => {
    if (value === null || value === undefined) return null;
    if (typeof value !== 'string') {
      return 'Status must be text';
    }
    return null;
  },

  // Formatting
  format: (value) => {
    return value ? String(value) : '';
  },

  // Metadata
  category: 'extended',
  version: '2.0',
  tags: ['status', 'state', 'workflow', 'color'],
};


export default statusPropertyConfig;
