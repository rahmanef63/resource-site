/**
 * Multi-Select Property - Menu Configuration
 * 
 * Defines property-specific menu items for Multi-Select type
 */

import type { PropertyTypeMenuConfig } from '../../components/PropertyMenu/menu-config';
import { Settings, Palette } from 'lucide-react';

export const multiSelectPropertyMenuConfig: PropertyTypeMenuConfig = {
  /**
   * Type-specific menu items for Multi-Select property
   * Similar to Select but with multi-value support
   */
  typeSpecificItems: [
    {
      id: 'editOptions',
      label: 'Edit property',
      icon: Settings,
      submenu: 'combobox', // Opens side sheet
    },
    {
      id: 'manageColors',
      label: 'Manage colors',
      icon: Palette,
    },
  ],
  
  /**
   * Multi-select specific calculate options
   */
  overrides: {
    calculate: {
      submenu: [
        { id: 'calculate-count', label: 'Count all', icon: undefined },
        { id: 'calculate-empty', label: 'Count empty', icon: undefined },
        { id: 'calculate-filled', label: 'Count filled', icon: undefined },
        { id: 'calculate-unique', label: 'Count unique values', icon: undefined },
        { id: 'calculate-percent-empty', label: 'Percent empty', icon: undefined },
        { id: 'calculate-percent-filled', label: 'Percent filled', icon: undefined },
        { id: 'calculate-values', label: 'Show all values', icon: undefined },
      ],
    },
  },
  
  hidden: [],
  disabled: [],
};
