/**
 * Rich Text Property - Menu Configuration
 * 
 * Defines property-specific menu items for Rich Text type
 */

import type { PropertyTypeMenuConfig } from '../../components/PropertyMenu/menu-config';

export const richTextPropertyMenuConfig: PropertyTypeMenuConfig = {
  /**
   * Rich text has no type-specific items, uses all base menu items
   */
  typeSpecificItems: [],
  
  /**
   * Rich text-specific calculate options (text-focused)
   */
  overrides: {
    calculate: {
      submenu: [
        { id: 'calculate-count', label: 'Count all', icon: undefined },
        { id: 'calculate-empty', label: 'Count empty', icon: undefined },
        { id: 'calculate-filled', label: 'Count filled', icon: undefined },
        { id: 'calculate-unique', label: 'Count unique', icon: undefined },
        { id: 'calculate-percent-empty', label: 'Percent empty', icon: undefined },
        { id: 'calculate-percent-filled', label: 'Percent filled', icon: undefined },
      ],
    },
  },
  
  hidden: [],
  disabled: [],
};
