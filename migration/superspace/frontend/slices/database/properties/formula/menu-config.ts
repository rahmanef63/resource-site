/**
 * Formula Property - Menu Configuration
 * 
 * Defines property-specific menu items for Formula type
 * Formula properties are computed from other properties
 */

import type { PropertyTypeMenuConfig } from '../../components/PropertyMenu/menu-config';
import { Calculator } from 'lucide-react';

export const formulaPropertyMenuConfig: PropertyTypeMenuConfig = {
  /**
   * Formula-specific items
   */
  typeSpecificItems: [
    {
      id: 'editFormula',
      label: 'Edit formula',
      icon: Calculator,
    },
  ],
  
  /**
   * Formula-specific calculate options (based on result type)
   */
  overrides: {
    calculate: {
      submenu: [
        { id: 'calculate-count', label: 'Count all', icon: undefined },
        { id: 'calculate-empty', label: 'Count empty', icon: undefined },
        { id: 'calculate-filled', label: 'Count filled', icon: undefined },
        { id: 'calculate-unique', label: 'Count unique', icon: undefined },
      ],
    },
  },
  
  /**
   * Formula cannot be duplicated (would duplicate formula logic)
   * Cannot delete (use hide instead)
   */
  hidden: ['duplicate'],
  
  /**
   * Formula cannot be made required (computed property)
   */
  disabled: ['toggleRequired'],
};
