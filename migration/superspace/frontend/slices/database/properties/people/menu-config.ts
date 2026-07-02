/**
 * People Property - Menu Configuration
 * 
 * Defines property-specific menu items for People type
 */

import type { PropertyTypeMenuConfig } from '../../components/PropertyMenu/menu-config';

export const peoplePropertyMenuConfig: PropertyTypeMenuConfig = {
  /**
   * No type-specific items for People
   */
  typeSpecificItems: [],
  
  /**
   * People-specific calculate options
   */
  overrides: {
    calculate: {
      submenu: [
        { id: 'calculate-unique', label: 'Count unique', icon: undefined },
        { id: 'calculate-empty', label: 'Count empty', icon: undefined },
        { id: 'calculate-filled', label: 'Count filled', icon: undefined },
      ],
    },
  },
  
  /**
   * No hidden items for People
   */
  hidden: [],
  
  /**
   * No disabled items for People
   */
  disabled: [],
};
