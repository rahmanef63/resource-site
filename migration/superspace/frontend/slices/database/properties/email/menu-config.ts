/**
 * Email Property - Menu Configuration
 * 
 * Defines property-specific menu items for Email type
 */

import type { PropertyTypeMenuConfig } from '../../components/PropertyMenu/menu-config';

export const emailPropertyMenuConfig: PropertyTypeMenuConfig = {
  /**
   * No type-specific items for Email
   */
  typeSpecificItems: [],
  
  /**
   * Email-specific calculate options
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
   * No hidden items for Email
   */
  hidden: [],
  
  /**
   * No disabled items for Email
   */
  disabled: [],
};
