import { UserCog } from 'lucide-react';
import type { PropertyConfig } from '../../registry/types';
import { LastEditedByRenderer } from './LastEditedByRenderer';
import { LastEditedByEditor } from './LastEditedByEditor';

export const lastEditedByPropertyConfig: PropertyConfig = {
  // Identification
  type: 'last_edited_by',
  label: 'Last Edited By',
  description: 'Automatically tracks who last modified the record',
  icon: UserCog,

  // Capabilities
  supportsOptions: false,
  supportsRequired: false,
  supportsUnique: false,
  supportsDefault: false,
  isAuto: true,
  isEditable: false,

  // Components
  Renderer: LastEditedByRenderer,
  Editor: LastEditedByEditor,

  // Validation (read-only, no validation needed)
  validate: () => null,

  // Formatting
  format: (value) => {
    if (!value) return '';
    if (typeof value === 'string') return value;
    if (typeof value === 'object' && value !== null && 'name' in value) {
      return String((value as { name: unknown }).name);
    }
    return String(value);
  },

  // Metadata
  category: 'auto',
  version: '2.0',
  tags: ['auto', 'user', 'modified', 'attribution'],
};

export default lastEditedByPropertyConfig;
