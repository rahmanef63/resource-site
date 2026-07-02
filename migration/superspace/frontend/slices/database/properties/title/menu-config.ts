/**
 * Title Property - Menu Configuration
 * 
 * Defines property-specific menu items for Title type
 */

import type { PropertyTypeMenuConfig } from '../../components/PropertyMenu/menu-config';
import { Image } from 'lucide-react';

export const titlePropertyMenuConfig: PropertyTypeMenuConfig = {
  /**
   * Title-specific items
   */
  typeSpecificItems: [
    {
      id: 'showPageIcon',
      label: 'Show page icon',
      icon: Image,
    },
  ],
  
  /**
   * Title-specific calculate (similar to text)
   */
  overrides: {
    calculate: {
      submenu: [
        { id: 'calculate-count', label: 'Count all', icon: undefined },
        { id: 'calculate-empty', label: 'Count empty', icon: undefined },
        { id: 'calculate-filled', label: 'Count filled', icon: undefined },
        { id: 'calculate-unique', label: 'Count unique', icon: undefined },
      ],
    },
  },
  
  /**
   * Title cannot be deleted, hidden, or made optional
   */
  hidden: ['delete'],
  disabled: ['toggleRequired', 'hide'],
};
