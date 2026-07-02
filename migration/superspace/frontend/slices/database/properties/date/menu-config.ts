/**
 * Date Property - Menu Configuration
 * 
 * Defines property-specific menu items for Date type
 */

import type { PropertyTypeMenuConfig } from '../../components/PropertyMenu/menu-config';
import { Calendar, Clock, Bell } from 'lucide-react';

export const datePropertyMenuConfig: PropertyTypeMenuConfig = {
  /**
   * Type-specific menu items for Date property
   */
  typeSpecificItems: [
    {
      id: 'dateFormat',
      label: 'Date format',
      icon: Calendar,
      submenu: [
        { id: 'format-full', label: 'Full date', icon: undefined },
        { id: 'format-Contactly', label: 'Contactly', icon: undefined },
        { id: 'format-us', label: 'US (MM/DD/YYYY)', icon: undefined },
        { id: 'format-european', label: 'European (DD/MM/YYYY)', icon: undefined },
        { id: 'format-iso', label: 'ISO (YYYY-MM-DD)', icon: undefined },
        { id: 'format-relative', label: 'Relative', icon: undefined },
      ],
    },
    {
      id: 'timeFormat',
      label: 'Time format',
      icon: Clock,
      submenu: [
        { id: 'time-12', label: '12 hour', icon: undefined },
        { id: 'time-24', label: '24 hour', icon: undefined },
        { id: 'time-none', label: 'No time', icon: undefined },
      ],
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: Bell,
    },
  ],
  
  /**
   * Date-specific calculate options
   */
  overrides: {
    calculate: {
      submenu: [
        { id: 'calculate-earliest', label: 'Earliest date', icon: undefined },
        { id: 'calculate-latest', label: 'Latest date', icon: undefined },
        { id: 'calculate-range', label: 'Date range', icon: undefined },
        { id: 'calculate-count', label: 'Count', icon: undefined },
        { id: 'calculate-empty', label: 'Count empty', icon: undefined },
        { id: 'calculate-filled', label: 'Count filled', icon: undefined },
      ],
    },
  },
  
  hidden: [],
  disabled: [],
};
