import { Calculator } from "lucide-react";
import type { PropertyConfig } from '../../registry/types';
import { RollupRenderer } from './RollupRenderer';
import { RollupEditor } from './RollupEditor';

export const rollupPropertyConfig: PropertyConfig = {
  // Identification
  type: 'rollup',
  label: 'Rollup',
  description: 'Aggregate values from related records',
  icon: Calculator,

  // Capabilities
  supportsOptions: true, // Need to specify relation, property, and aggregation
  supportsRequired: false,
  supportsUnique: false,
  supportsDefault: false,
  isAuto: true, // Computed automatically
  isEditable: false, // Read-only

  // Components
  Renderer: RollupRenderer,
  Editor: RollupEditor,

  // Validation
  validate: (value) => {
    // Rollup values can be any type (number, string, array, etc.)
    return null;
  },

  // Formatting
  format: (value) => {
    if (value === null || value === undefined) return '';
    if (typeof value === 'number') {
      return new Intl.NumberFormat('en-US').format(value);
    }
    return String(value);
  },

  // Metadata
  category: 'extended',
  version: '2.0',
  tags: ['rollup', 'aggregate', 'computed'],
};


export default rollupPropertyConfig;
