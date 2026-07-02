/**
 * Relation Property - Menu Configuration
 * 
 * Defines property-specific menu items for Relation type
 * Relation properties link to records in other databases
 */

import type { PropertyTypeMenuConfig } from '../../components/PropertyMenu/menu-config';
import { Link2, Settings2 } from 'lucide-react';

export const relationPropertyMenuConfig: PropertyTypeMenuConfig = {
  /**
   * Relation-specific items
   */
  typeSpecificItems: [
    {
      id: 'editRelation',
      label: 'Edit relation',
      icon: Link2,
    },
    {
      id: 'showAs',
      label: 'Show as',
      icon: Settings2,
      submenu: [
        { id: 'showas-cards', label: 'Cards', icon: undefined },
        { id: 'showas-list', label: 'List', icon: undefined },
      ],
    },
  ],
  
  /**
   * Relation-specific calculate options
   */
  overrides: {
    calculate: {
      submenu: [
        { id: 'calculate-count', label: 'Count relations', icon: undefined },
        { id: 'calculate-empty', label: 'Count empty', icon: undefined },
        { id: 'calculate-filled', label: 'Count filled', icon: undefined },
        { id: 'calculate-unique', label: 'Count unique', icon: undefined },
      ],
    },
  },
  
  /**
   * No hidden items for Relation
   */
  hidden: [],
  
  /**
   * No disabled items for Relation
   */
  disabled: [],
};
