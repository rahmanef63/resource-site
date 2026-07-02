/**
 * Button Property - Menu Configuration
 * 
 * Defines property-specific menu items for Button type
 * Button properties trigger actions when clicked
 */

import type { PropertyTypeMenuConfig } from '../../components/PropertyMenu/menu-config';
import { Zap } from 'lucide-react';

export const buttonPropertyMenuConfig: PropertyTypeMenuConfig = {
  /**
   * Button-specific items
   */
  typeSpecificItems: [
    {
      id: 'editAction',
      label: 'Edit action',
      icon: Zap,
    },
  ],
  
  /**
   * Buttons don't have calculate options
   */
  overrides: {
    calculate: {
      hidden: true,
    },
  },
  
  /**
   * Button cannot have filter, calculate, or wrap
   */
  hidden: ['filter', 'calculate', 'wrap'],
  
  /**
   * Button cannot be made required
   */
  disabled: ['toggleRequired'],
};
