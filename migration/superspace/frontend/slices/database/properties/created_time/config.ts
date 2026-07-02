import { Clock } from "lucide-react";
import type { PropertyConfig } from '../../registry/types';
import { CreatedTimeRenderer } from './CreatedTimeRenderer';
import { CreatedTimeEditor } from './CreatedTimeEditor';

export const createdTimePropertyConfig: PropertyConfig = {
  // Identification
  type: 'created_time',
  label: 'Created Time',
  description: 'Auto-generated creation timestamp',
  icon: Clock,

  // Capabilities
  supportsOptions: false,
  supportsRequired: false,
  supportsUnique: false,
  supportsDefault: false,
  isAuto: true, // Auto-generated
  isEditable: false, // Read-only

  // Components
  Renderer: CreatedTimeRenderer,
  Editor: CreatedTimeEditor,

  // Validation
  validate: (value) => {
    if (value === null || value === undefined) return null;
    
    try {
      const date = new Date(String(value));
      if (isNaN(date.getTime())) {
        return 'Invalid timestamp format';
      }
      return null;
    } catch {
      return 'Invalid timestamp format';
    }
  },

  // Formatting
  format: (value) => {
    if (!value) return '';
    try {
      const date = new Date(String(value));
      if (isNaN(date.getTime())) return '';
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(date);
    } catch {
      return '';
    }
  },

  // Metadata
  category: 'auto',
  version: '2.0',
  tags: ['time', 'timestamp', 'created', 'auto-generated', 'audit'],
};


export default createdTimePropertyConfig;
