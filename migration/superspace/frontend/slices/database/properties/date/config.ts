import { Calendar as CalendarIcon } from "lucide-react";
import type { PropertyConfig } from '../../registry/types';
import { DateRenderer } from './DateRenderer';
import { DateEditor } from './DateEditor';

export const datePropertyConfig: PropertyConfig = {
  // Identification
  type: 'date',
  label: 'Date',
  description: 'Date with range support',
  icon: CalendarIcon,

  // Capabilities
  supportsOptions: false,
  supportsRequired: false,
  supportsUnique: false,
  supportsDefault: true,
  isAuto: false,
  isEditable: true,

  // Components
  Renderer: DateRenderer,
  Editor: DateEditor,

  // Validation
  validate: (value) => {
    if (value === null || value === undefined) return null;
    
    try {
      const date = new Date(String(value));
      if (isNaN(date.getTime())) {
        return 'Invalid date format';
      }
      return null;
    } catch {
      return 'Invalid date format';
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
      }).format(date);
    } catch {
      return '';
    }
  },

  // Metadata
  category: 'core',
  version: '2.0',
  tags: ['date', 'time', 'calendar'],
};


export default datePropertyConfig;
