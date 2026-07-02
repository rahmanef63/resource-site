/**
 * Phone Property - Menu Configuration
 * 
 * Defines property-specific menu items for Phone type
 */

import type { PropertyTypeMenuConfig } from '../../components/PropertyMenu/menu-config';

export const phonePropertyMenuConfig: PropertyTypeMenuConfig = {
  /**
   * No type-specific items for Phone
   */
  typeSpecificItems: [],
  
  /**
   * Phone-specific calculate options
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
   * No hidden items for Phone
   */
  hidden: [],
  
  /**
   * No disabled items for Phone
   */
  disabled: [],
};
