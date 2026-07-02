/**
 * Last Edited Time Property - Menu Configuration
 * 
 * Defines property-specific menu items for Last Edited Time type
 * Auto-populated property, similar to Created Time
 */

import type { PropertyTypeMenuConfig } from '../../components/PropertyMenu/menu-config';

export const lastEditedTimePropertyMenuConfig: PropertyTypeMenuConfig = {
  /**
   * No type-specific items for Last Edited Time
   */
  typeSpecificItems: [],
  
  /**
   * Last Edited Time-specific calculate options
   */
  overrides: {
    calculate: {
      submenu: [
        { id: 'calculate-earliest', label: 'Earliest date', icon: undefined },
        { id: 'calculate-latest', label: 'Latest date', icon: undefined },
        { id: 'calculate-date-range', label: 'Date range', icon: undefined },
      ],
    },
  },
  
  /**
   * Last Edited Time cannot be duplicated or deleted (auto property)
   */
  hidden: ['duplicate', 'delete'],
  
  /**
   * Cannot be made required (always auto-populated)
   */
  disabled: ['toggleRequired'],
};
