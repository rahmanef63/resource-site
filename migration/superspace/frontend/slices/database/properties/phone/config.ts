import { Phone as PhoneIcon } from "lucide-react";
import type { PropertyConfig } from '../../registry/types';
import { PhoneRenderer } from './PhoneRenderer';
import { PhoneEditor } from './PhoneEditor';

export const phonePropertyConfig: PropertyConfig = {
  // Identification
  type: 'phone',
  label: 'Phone',
  description: 'Phone number with tel: link',
  icon: PhoneIcon,

  // Capabilities
  supportsOptions: false,
  supportsRequired: false,
  supportsUnique: false,
  supportsDefault: true,
  isAuto: false,
  isEditable: true,

  // Components
  Renderer: PhoneRenderer,
  Editor: PhoneEditor,

  // Validation
  validate: (value) => {
    if (!value) return null;

    if (typeof value !== 'string') {
      return 'Phone must be text';
    }

    // Basic phone validation (digits, spaces, dashes, parentheses, plus)
    const phoneRegex = /^[\d\s\-\(\)\+]+$/;
    if (!phoneRegex.test(value)) {
      return 'Invalid phone number format';
    }

    return null;
  },

  // Formatting
  format: (value) => {
    return typeof value === 'string' ? value.trim() : '';
  },

  // Metadata
  category: 'extended',
  version: '2.0',
  tags: ['phone', 'contact', 'tel'],
};


export default phonePropertyConfig;
