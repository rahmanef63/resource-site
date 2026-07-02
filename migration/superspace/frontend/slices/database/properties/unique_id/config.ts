import { Hash } from "lucide-react";
import type { PropertyConfig } from '../../registry/types';
import { UniqueIdRenderer } from './UniqueIdRenderer';
import { UniqueIdEditor } from './UniqueIdEditor';

export const uniqueIdPropertyConfig: PropertyConfig = {
  // Identification
  type: 'unique_id',
  label: 'Unique ID',
  description: 'Auto-generated unique identifier',
  icon: Hash,

  // Capabilities
  supportsOptions: false,
  supportsRequired: false,
  supportsUnique: true, // Always unique
  supportsDefault: false,
  isAuto: true, // Auto-generated
  isEditable: false, // Read-only

  // Components
  Renderer: UniqueIdRenderer,
  Editor: UniqueIdEditor,

  // Validation
  validate: (value) => {
    if (value === null || value === undefined) return null;
    if (typeof value !== 'string' && typeof value !== 'number') {
      return 'Unique ID must be text or number';
    }
    return null;
  },

  // Formatting
  format: (value) => {
    return value ? String(value) : '';
  },

  // Metadata
  category: 'auto',
  version: '2.0',
  tags: ['id', 'unique', 'auto-generated', 'identifier'],
};


export default uniqueIdPropertyConfig;
