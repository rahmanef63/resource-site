/**
 * Created Time Property - Menu Configuration
 * 
 * Auto-generated property (read-only)
 */

import type { PropertyTypeMenuConfig } from '../../components/PropertyMenu/menu-config';
import { Calendar, Clock } from 'lucide-react';

export const createdTimePropertyMenuConfig: PropertyTypeMenuConfig = {
  /**
   * Date/time format options
   */
  typeSpecificItems: [
    {
      id: 'dateFormat',
      label: 'Date format',
      icon: Calendar,
      submenu: [
        { id: 'format-full', label: 'Full date', icon: undefined },
        { id: 'format-Contactly', label: 'Contactly', icon: undefined },
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
      ],
    },
  ],
  
  /**
   * Date-based calculations
   */
  overrides: {
    calculate: {
      submenu: [
        { id: 'calculate-earliest', label: 'Earliest', icon: undefined },
        { id: 'calculate-latest', label: 'Latest', icon: undefined },
        { id: 'calculate-range', label: 'Date range', icon: undefined },
      ],
    },
  },
  
  /**
   * Auto properties cannot be deleted or made required
   */
  hidden: ['delete', 'duplicate'],
  disabled: ['toggleRequired'],
};
