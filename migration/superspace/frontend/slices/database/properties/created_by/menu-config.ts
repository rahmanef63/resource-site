/**
 * Created By Property - Menu Configuration
 * 
 * Auto-generated property (read-only)
 */

import type { PropertyTypeMenuConfig } from '../../components/PropertyMenu/menu-config';

export const createdByPropertyMenuConfig: PropertyTypeMenuConfig = {
  /**
   * Created By has no type-specific items
   */
  typeSpecificItems: [],
  
  /**
   * Person-based calculations
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
   * Auto properties cannot be deleted or made required
   */
  hidden: ['delete', 'duplicate'],
  disabled: ['toggleRequired'],
};
