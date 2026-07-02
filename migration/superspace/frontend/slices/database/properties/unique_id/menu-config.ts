/**
 * Unique ID Property - Menu Configuration
 * 
 * Defines property-specific menu items for Unique ID type
 * Auto-generated unique identifier for each row
 */

import type { PropertyTypeMenuConfig } from '../../components/PropertyMenu/menu-config';
import { Settings2 } from 'lucide-react';

export const uniqueIdPropertyMenuConfig: PropertyTypeMenuConfig = {
  /**
   * Unique ID-specific items
   */
  typeSpecificItems: [
    {
      id: 'idFormat',
      label: 'ID format',
      icon: Settings2,
    },
  ],
  
  /**
   * Unique ID-specific calculate options
   */
  overrides: {
    calculate: {
      submenu: [
        { id: 'calculate-unique', label: 'Count unique', icon: undefined },
      ],
    },
  },
  
  /**
   * Unique ID cannot be duplicated or deleted (auto property)
   */
  hidden: ['duplicate', 'delete'],
  
  /**
   * Cannot be made required (always auto-populated)
   * Cannot hide (always visible)
   */
  disabled: ['toggleRequired', 'hide'],
};
