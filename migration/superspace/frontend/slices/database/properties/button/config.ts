import { MousePointerClick } from "lucide-react";
import type { PropertyConfig } from '../../registry/types';
import { ButtonRenderer } from './ButtonRenderer';
import { ButtonEditor } from './ButtonEditor';

type ButtonAction = 'url' | 'email' | 'phone' | 'copy' | 'webhook';

export const buttonPropertyConfig: PropertyConfig = {
  // Identification
  type: 'button',
  label: 'Button',
  description: 'Clickable button with action triggers (URL, email, phone, copy, webhook)',
  icon: MousePointerClick,

  // Capabilities
  supportsOptions: true, // Can define button label, action type, style, confirmation
  supportsRequired: false,
  supportsUnique: false,
  supportsDefault: false,
  isAuto: false,
  isEditable: true,

  // Components
  Renderer: ButtonRenderer,
  Editor: ButtonEditor,

  // Validation
  validate: (value, options) => {
    if (value === null || value === undefined) return null;
    if (typeof value !== 'string') {
      return 'Button value must be text';
    }

    // Validate based on action type
    const action = (options && 'action' in options ? options.action : 'url') as ButtonAction;
    
    if (action === 'url' || action === 'webhook') {
      try {
        new URL(value);
      } catch {
        return `Invalid ${action === 'webhook' ? 'webhook URL' : 'URL'}`;
      }
    }
    
    if (action === 'email' && !value.includes('@')) {
      return 'Invalid email address';
    }
    
    if (action === 'phone' && value.length < 5) {
      return 'Invalid phone number';
    }

    return null;
  },

  // Formatting
  format: (value) => {
    return value ? String(value) : '';
  },

  // Metadata
  category: 'extended',
  version: '2.0',
  tags: ['button', 'action', 'trigger', 'interactive', 'url', 'email', 'phone', 'webhook'],
};


export default buttonPropertyConfig;
