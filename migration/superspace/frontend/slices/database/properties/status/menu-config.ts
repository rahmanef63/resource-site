/**
 * Status Property - Menu Configuration
 * 
 * Defines property-specific menu items for Status type
 * Similar to Select but with status-specific options
 */

import type { PropertyTypeMenuConfig } from '../../components/PropertyMenu/menu-config';
import { Palette } from 'lucide-react';

export const statusPropertyMenuConfig: PropertyTypeMenuConfig = {
  /**
   * Status-specific items
   */
  typeSpecificItems: [
    {
      id: 'manageColors',
      label: 'Manage colors',
      icon: Palette,
    },
  ],
  
  /**
   * Status-specific calculate options
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
  
  /**
   * No hidden items for Status
   */
  hidden: [],
  
  /**
   * No disabled items for Status
   */
  disabled: [],
};
