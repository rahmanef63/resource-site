/**
 * Property Menu Configuration
 * 
 * Defines base menu items that are common across all property types,
 * and allows property-specific extensions.
 */

import type { PropertyMenuItem, PropertyMenuAction } from './types';
import {
  Pencil,
  Copy,
  RefreshCw,
  EyeOff,
  Trash2,
  Check,
  ArrowUpDown,
  ArrowUpAZ,
  ArrowDownAZ,
  Filter,
  Sigma,
  WrapText,
  ArrowLeft,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Settings,
} from 'lucide-react';

/**
 * Base Menu Configuration
 * These are common actions available for ALL property types
 */
export const BASE_MENU_ITEMS: Record<PropertyMenuAction | string, Omit<PropertyMenuItem, 'onClick'>> = {
  // Edit Section
  rename: {
    id: 'rename',
    label: 'Rename property',
    icon: Pencil,
    shortcut: '⌘R',
  },
  duplicate: {
    id: 'duplicate',
    label: 'Duplicate property',
    icon: Copy,
  },
  changeType: {
    id: 'changeType',
    label: 'Change type...',
    icon: RefreshCw,
  },
  
  // Data Section
  sortAsc: {
    id: 'sortAsc',
    label: 'Sort ascending',
    icon: ArrowUpAZ,
  },
  sortDesc: {
    id: 'sortDesc',
    label: 'Sort descending',
    icon: ArrowDownAZ,
  },
  filter: {
    id: 'filter',
    label: 'Filter',
    icon: Filter,
  },
  calculate: {
    id: 'calculate',
    label: 'Calculate',
    icon: Sigma,
    submenu: [
      { id: 'calculate-count', label: 'Count', icon: Sigma },
      { id: 'calculate-empty', label: 'Count empty', icon: Sigma },
      { id: 'calculate-filled', label: 'Count filled', icon: Sigma },
      { id: 'calculate-unique', label: 'Count unique', icon: Sigma },
      { id: 'calculate-percent-empty', label: 'Percent empty', icon: Sigma },
      { id: 'calculate-percent-filled', label: 'Percent filled', icon: Sigma },
    ],
  },
  
  // Column Section
  wrap: {
    id: 'wrap',
    label: 'Wrap in view',
    icon: WrapText,
  },
  insertLeft: {
    id: 'insertLeft',
    label: 'Insert left',
    icon: ArrowLeft,
  },
  insertRight: {
    id: 'insertRight',
    label: 'Insert right',
    icon: ArrowRight,
  },
  moveLeft: {
    id: 'moveLeft',
    label: 'Move left',
    icon: ChevronLeft,
  },
  moveRight: {
    id: 'moveRight',
    label: 'Move right',
    icon: ChevronRight,
  },
  
  // Settings Section
  toggleRequired: {
    id: 'toggleRequired',
    label: 'Required',
    icon: Check,
  },
  hide: {
    id: 'hide',
    label: 'Hide in view',
    icon: EyeOff,
  },
  
  // Danger Section
  delete: {
    id: 'delete',
    label: 'Delete property',
    icon: Trash2,
    variant: 'danger',
  },
};

/**
 * Menu Sections Order
 * Defines the order and grouping of menu items
 */
export const MENU_SECTIONS = {
  edit: ['rename', 'duplicate'],
  data: ['sortAsc', 'sortDesc', 'filter', 'calculate'],
  column: ['wrap', 'insertLeft', 'insertRight', 'moveLeft', 'moveRight'],
  settings: ['toggleRequired', 'hide'],
  danger: ['delete'],
} as const;

/**
 * Property Type Menu Extensions
 * Each property type can add its own menu items
 */
export interface PropertyTypeMenuConfig {
  /**
   * Additional menu items specific to this property type
   * These will be inserted after 'duplicate' and before 'sortAsc'
   */
  typeSpecificItems?: Array<PropertyMenuItem | {
    id: string;
    label: string;
    icon?: React.ComponentType<{ className?: string }>;
    shortcut?: string;
    submenu?: PropertyMenuItem[] | 'dynamic' | 'combobox'; // Allow 'dynamic' for runtime-generated submenus, 'combobox' for combobox
    onClick?: () => void;
  }>;
  
  /**
   * Override base menu items behavior
   */
  overrides?: {
    [K in PropertyMenuAction]?: Partial<PropertyMenuItem>;
  };
  
  /**
   * Hide certain base menu items
   */
  hidden?: PropertyMenuAction[];
  
  /**
   * Disable certain base menu items
   */
  disabled?: PropertyMenuAction[];
}

/**
 * Default configuration for property types
 */
export const DEFAULT_PROPERTY_MENU_CONFIG: PropertyTypeMenuConfig = {
  typeSpecificItems: [],
  overrides: {},
  hidden: [],
  disabled: [],
};
