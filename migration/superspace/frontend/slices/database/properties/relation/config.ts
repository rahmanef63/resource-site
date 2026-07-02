import { Link2 } from "lucide-react";
import type { PropertyConfig } from '../../registry/types';
import { RelationRenderer } from './RelationRenderer';
import { RelationEditor } from './RelationEditor';

export const relationPropertyConfig: PropertyConfig = {
  // Identification
  type: 'relation',
  label: 'Relation',
  description: 'Link to other database records',
  icon: Link2,

  // Capabilities
  supportsOptions: true, // Need to specify target database
  supportsRequired: false,
  supportsUnique: false,
  supportsDefault: false,
  isAuto: false,
  isEditable: true,

  // Components
  Renderer: RelationRenderer,
  Editor: RelationEditor,

  // Validation
  validate: (value) => {
    if (value === null || value === undefined) return null;
    if (Array.isArray(value) || typeof value === 'object' || typeof value === 'string') {
      return null;
    }
    return 'Relation must be an ID, array, or object';
  },

  // Formatting
  format: (value) => {
    if (!value) return '';
    if (Array.isArray(value)) {
      return `${value.length} linked record(s)`;
    }
    return '1 linked record';
  },

  // Metadata
  category: 'core',
  version: '2.0',
  tags: ['relation', 'link', 'reference'],
};


export default relationPropertyConfig;
