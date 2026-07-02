/**
 * Files Property - Menu Configuration
 * 
 * Defines property-specific menu items for Files type
 */

import type { PropertyTypeMenuConfig } from '../../components/PropertyMenu/menu-config';

export const filesPropertyMenuConfig: PropertyTypeMenuConfig = {
  /**
   * No type-specific items for Files
   */
  typeSpecificItems: [],
  
  /**
   * Files-specific calculate options
   */
  overrides: {
    calculate: {
      submenu: [
        { id: 'calculate-count', label: 'Count files', icon: undefined },
        { id: 'calculate-empty', label: 'Count empty', icon: undefined },
        { id: 'calculate-filled', label: 'Count filled', icon: undefined },
      ],
    },
  },
  
  /**
   * No hidden items for Files
   */
  hidden: [],
  
  /**
   * No disabled items for Files
   */
  disabled: [],
};
