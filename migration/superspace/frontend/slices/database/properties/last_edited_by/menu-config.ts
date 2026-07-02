/**
 * Last Edited By Property - Menu Configuration
 * 
 * Defines property-specific menu items for Last Edited By type
 * Auto-populated property, similar to Created By
 */

import type { PropertyTypeMenuConfig } from '../../components/PropertyMenu/menu-config';

export const lastEditedByPropertyMenuConfig: PropertyTypeMenuConfig = {
  /**
   * No type-specific items for Last Edited By
   */
  typeSpecificItems: [],
  
  /**
   * Last Edited By-specific calculate options
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
   * Last Edited By cannot be duplicated or deleted (auto property)
   */
  hidden: ['duplicate', 'delete'],
  
  /**
   * Cannot be made required (always auto-populated)
   */
  disabled: ['toggleRequired'],
};
