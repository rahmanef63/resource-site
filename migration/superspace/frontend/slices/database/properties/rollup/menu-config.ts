/**
 * Rollup Property - Menu Configuration
 * 
 * Defines property-specific menu items for Rollup type
 * Rollup properties aggregate values from related records
 */

import type { PropertyTypeMenuConfig } from '../../components/PropertyMenu/menu-config';
import { TrendingUp } from 'lucide-react';

export const rollupPropertyMenuConfig: PropertyTypeMenuConfig = {
  /**
   * Rollup-specific items
   */
  typeSpecificItems: [
    {
      id: 'editRollup',
      label: 'Edit rollup',
      icon: TrendingUp,
    },
  ],
  
  /**
   * Rollup-specific calculate options (based on aggregation type)
   */
  overrides: {
    calculate: {
      submenu: [
        { id: 'calculate-count', label: 'Count all', icon: undefined },
        { id: 'calculate-empty', label: 'Count empty', icon: undefined },
        { id: 'calculate-filled', label: 'Count filled', icon: undefined },
        { id: 'calculate-sum', label: 'Sum', icon: undefined },
        { id: 'calculate-average', label: 'Average', icon: undefined },
        { id: 'calculate-min', label: 'Min', icon: undefined },
        { id: 'calculate-max', label: 'Max', icon: undefined },
      ],
    },
  },
  
  /**
   * Rollup cannot be duplicated (would duplicate rollup logic)
   * Cannot delete (use hide instead)
   */
  hidden: ['duplicate'],
  
  /**
   * Rollup cannot be made required (computed property)
   */
  disabled: ['toggleRequired'],
};
