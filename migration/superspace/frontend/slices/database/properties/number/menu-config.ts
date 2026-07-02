/**
 * Number Property - Menu Configuration
 * 
 * Defines property-specific menu items for Number type
 */

import type { PropertyTypeMenuConfig } from '../../components/PropertyMenu/menu-config';
import { Hash, BarChart } from 'lucide-react';

export const numberPropertyMenuConfig: PropertyTypeMenuConfig = {
  /**
   * Type-specific menu items for Number property
   */
  typeSpecificItems: [
    {
      id: 'setFormat',
      label: 'Number format',
      icon: Hash,
      submenu: [
        { id: 'format-number', label: 'Number', icon: undefined },
        { id: 'format-number-commas', label: 'Number with commas', icon: undefined },
        { id: 'format-percent', label: 'Percent', icon: undefined },
        { id: 'format-currency-idr', label: 'Rupiah (IDR)', icon: undefined },
        { id: 'format-currency-usd', label: 'US Dollar (USD)', icon: undefined },
        { id: 'format-currency-eur', label: 'Euro (EUR)', icon: undefined },
        { id: 'format-currency-gbp', label: 'Pound (GBP)', icon: undefined },
        { id: 'format-currency-jpy', label: 'Yen (JPY)', icon: undefined },
      ],
    },
    {
      id: 'showAs',
      label: 'Show as',
      icon: BarChart,
      submenu: [
        { id: 'show-number', label: 'Number', icon: undefined },
        { id: 'show-bar', label: 'Bar', icon: undefined },
        { id: 'show-ring', label: 'Ring', icon: undefined },
      ],
    },
  ],
  
  /**
   * Number-specific calculate options
   */
  overrides: {
    calculate: {
      submenu: [
        { id: 'calculate-sum', label: 'Sum', icon: undefined },
        { id: 'calculate-average', label: 'Average', icon: undefined },
        { id: 'calculate-median', label: 'Median', icon: undefined },
        { id: 'calculate-min', label: 'Min', icon: undefined },
        { id: 'calculate-max', label: 'Max', icon: undefined },
        { id: 'calculate-range', label: 'Range', icon: undefined },
        { id: 'calculate-count', label: 'Count', icon: undefined },
        { id: 'calculate-empty', label: 'Count empty', icon: undefined },
        { id: 'calculate-filled', label: 'Count filled', icon: undefined },
      ],
    },
  },
  
  hidden: [],
  disabled: [],
};
