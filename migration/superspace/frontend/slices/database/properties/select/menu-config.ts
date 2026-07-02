/**
 * Select Property - Menu Configuration
 * 
 * Defines property-specific menu items for Select type
 */

import type { PropertyTypeMenuConfig } from '../../components/PropertyMenu/menu-config';
import { Settings, Palette } from 'lucide-react';

export const selectPropertyMenuConfig: PropertyTypeMenuConfig = {
  /**
   * Type-specific menu items for Select property
   * These appear after "Duplicate" in the menu
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
   * Override calculate submenu for Select
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
        { id: 'calculate-mode', label: 'Show most common', icon: undefined },
      ],
    },
  },
  
  /**
   * Hide wrap option for select (not applicable)
   */
  hidden: [],
  
  /**
   * No disabled items
   */
  disabled: [],
};
