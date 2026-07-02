/**
 * Checkbox Property - Menu Configuration
 * 
 * Defines property-specific menu items for Checkbox type
 */

import type { PropertyTypeMenuConfig } from '../../components/PropertyMenu/menu-config';

export const checkboxPropertyMenuConfig: PropertyTypeMenuConfig = {
  /**
   * Checkbox has no type-specific items
   */
  typeSpecificItems: [],
  
  /**
   * Checkbox-specific calculate options (boolean-focused)
   */
  overrides: {
    calculate: {
      submenu: [
        { id: 'calculate-checked', label: 'Count checked', icon: undefined },
        { id: 'calculate-unchecked', label: 'Count unchecked', icon: undefined },
        { id: 'calculate-percent-checked', label: 'Percent checked', icon: undefined },
        { id: 'calculate-percent-unchecked', label: 'Percent unchecked', icon: undefined },
      ],
    },
  },
  
  hidden: [],
  disabled: [],
};
