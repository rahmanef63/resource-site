import { FileText } from "lucide-react";
import type { PropertyConfig } from '../../registry/types';
import { RichTextRenderer } from './RichTextRenderer';
import { RichTextEditor } from './RichTextEditor';

export const richTextPropertyConfig: PropertyConfig = {
  // Identification
  type: 'rich_text',
  label: 'Rich Text',
  description: 'Multi-line text with markdown support',
  icon: FileText,

  // Capabilities
  supportsOptions: false,
  supportsRequired: false,
  supportsUnique: false,
  supportsDefault: true,
  isAuto: false,
  isEditable: true,

  // Components
  Renderer: RichTextRenderer,
  Editor: RichTextEditor,

  // Validation
  validate: (value) => {
    if (value === null || value === undefined || value === '') return null;
    if (typeof value !== 'string') {
      return 'Must be valid text';
    }
    return null;
  },

  // Formatting
  format: (value) => {
    if (!value) return '';
    return String(value).trim();
  },

  // Metadata
  category: 'core',
  version: '2.0',
  tags: ['text', 'markdown', 'multiline', 'rich'],
};


export default richTextPropertyConfig;
