import { Clock } from 'lucide-react';
import type { PropertyConfig } from '../../registry/types';
import { LastEditedTimeRenderer } from './LastEditedTimeRenderer';
import { LastEditedTimeEditor } from './LastEditedTimeEditor';

export const lastEditedTimePropertyConfig: PropertyConfig = {
  // Identification
  type: 'last_edited_time',
  label: 'Last Edited Time',
  description: 'Automatically tracks when the record was last modified',
  icon: Clock,

  // Capabilities
  supportsOptions: false,
  supportsRequired: false,
  supportsUnique: false,
  supportsDefault: false,
  isAuto: true,
  isEditable: false,

  // Components
  Renderer: LastEditedTimeRenderer,
  Editor: LastEditedTimeEditor,

  // Validation (read-only, no validation needed)
  validate: () => null,

  // Formatting
  format: (value) => {
    if (!value) return '';
    try {
      const timestamp = typeof value === 'number' ? value : new Date(String(value)).getTime();
      return new Date(timestamp).toLocaleString();
    } catch {
      return '';
    }
  },

  // Metadata
  category: 'auto',
  version: '2.0',
  tags: ['auto', 'timestamp', 'modified', 'time'],
};

export default lastEditedTimePropertyConfig;
