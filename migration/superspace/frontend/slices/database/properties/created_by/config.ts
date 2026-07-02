import { UserCircle } from "lucide-react";
import type { PropertyConfig } from '../../registry/types';
import { CreatedByRenderer } from './CreatedByRenderer';
import { CreatedByEditor } from './CreatedByEditor';

export const createdByPropertyConfig: PropertyConfig = {
  // Identification
  type: 'created_by',
  label: 'Created By',
  description: 'Auto-generated creator user reference',
  icon: UserCircle,

  // Capabilities
  supportsOptions: false,
  supportsRequired: false,
  supportsUnique: false,
  supportsDefault: false,
  isAuto: true, // Auto-generated
  isEditable: false, // Read-only

  // Components
  Renderer: CreatedByRenderer,
  Editor: CreatedByEditor,

  // Validation
  validate: (value) => {
    if (value === null || value === undefined) return null;
    
    // Can be string, object, or user ID
    if (typeof value === 'string' || typeof value === 'object') {
      return null;
    }
    
    return 'Created by must be text or user object';
  },

  // Formatting
  format: (value) => {
    if (!value) return '';
    if (typeof value === 'string') return value;
    if (typeof value === 'object' && value !== null) {
      if ('name' in value) return String(value.name);
      if ('email' in value) return String(value.email);
      if ('id' in value) return String(value.id);
    }
    return String(value);
  },

  // Metadata
  category: 'auto',
  version: '2.0',
  tags: ['user', 'creator', 'author', 'auto-generated', 'audit'],
};


export default createdByPropertyConfig;
