import { Users } from "lucide-react";
import type { PropertyConfig } from '../../registry/types';
import { PeopleRenderer } from './PeopleRenderer';
import { PeopleEditor } from './PeopleEditor';

export const peoplePropertyConfig: PropertyConfig = {
  // Identification
  type: 'people',
  label: 'People',
  description: 'Person or people with avatar display',
  icon: Users,

  // Capabilities
  supportsOptions: false,
  supportsRequired: false,
  supportsUnique: false,
  supportsDefault: false,
  isAuto: false,
  isEditable: true,

  // Components
  Renderer: PeopleRenderer,
  Editor: PeopleEditor,

  // Validation
  validate: (value) => {
    if (value === null || value === undefined) return null;
    
    if (Array.isArray(value)) {
      return null; // Arrays are valid
    }
    
    if (typeof value === 'object') {
      return null; // Objects are valid
    }
    
    if (typeof value === 'string') {
      return null; // Strings are valid
    }
    
    return 'People must be an array, object, or string';
  },

  // Formatting
  format: (value) => {
    if (!value) return '';
    if (Array.isArray(value)) {
      return value
        .map(p => typeof p === 'object' && p !== null && 'name' in p ? p.name : String(p))
        .join(', ');
    }
    if (typeof value === 'object' && value !== null && 'name' in value) {
      return String(value.name);
    }
    return String(value);
  },

  // Metadata
  category: 'core',
  version: '2.0',
  tags: ['people', 'user', 'person', 'avatar'],
};


export default peoplePropertyConfig;
