import type { DatabaseField } from '../../types';
import type { Property } from '@/frontend/shared/foundation/types/universal-database';

/**
 * Property Menu Action Types
 */
export type PropertyMenuAction =
  | 'rename'
  | 'duplicate'
  | 'hide'
  | 'delete'
  | 'toggleRequired'
  | 'editOptions'
  | 'setFormat'
  | 'sortAsc'
  | 'sortDesc'
  | 'filter'
  | 'calculate'
  | 'wrap'
  | 'insertLeft'
  | 'insertRight'
  | 'moveLeft'
  | 'moveRight';

/**
 * Property Menu Item Configuration
 */
export interface PropertyMenuItem {
  id: PropertyMenuAction | string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  shortcut?: string;
  variant?: 'default' | 'danger';
  separator?: boolean;
  disabled?: boolean;
  hidden?: boolean;
  onClick?: () => void;
  submenu?: PropertyMenuItem[] | 'combobox'; // Allow 'combobox' for special rendering
  badge?: {
    color?: string;
    text: string;
  };
  color?: string; // For color picker items
}

/**
 * Property Menu Section
 */
export interface PropertyMenuSection {
  title?: string;
  items: PropertyMenuItem[];
}

/**
 * Property-specific Menu Extension
 */
export interface PropertyMenuExtension {
  /**
   * Get additional menu items for this property type
   */
  getMenuItems: (params: PropertyMenuExtensionParams) => PropertyMenuItem[];
}

export interface PropertyMenuExtensionParams {
  field: DatabaseField | Property;
  value?: unknown;
  onAction?: (action: string, payload?: unknown) => void;
}

/**
 * Property Menu Props
 */
export interface PropertyMenuProps {
  field: DatabaseField | Property;
  isVisible?: boolean;
  isRequired?: boolean;
  
  // Common Actions
  onRename?: (fieldId: string, name: string) => Promise<void> | void;
  onDuplicate?: (fieldId: string) => Promise<void> | void;
  onChangeType?: (fieldId: string, newType: any) => Promise<void> | void;
  onHide?: (fieldId: string) => Promise<void> | void;
  onDelete?: (fieldId: string) => Promise<void> | void;
  onToggleRequired?: (fieldId: string, required: boolean) => Promise<void> | void;
  
  // Column Actions
  onInsertLeft?: (fieldId: string) => Promise<void> | void;
  onInsertRight?: (fieldId: string) => Promise<void> | void;
  onMoveLeft?: (fieldId: string) => Promise<void> | void;
  onMoveRight?: (fieldId: string) => Promise<void> | void;
  
  // Data Actions
  onSort?: (fieldId: string, direction: 'asc' | 'desc') => Promise<void> | void;
  onFilter?: (fieldId: string) => Promise<void> | void;
  onCalculate?: (fieldId: string, aggregation: string) => Promise<void> | void;
  onWrap?: (fieldId: string) => Promise<void> | void;
  
  // Type-specific Actions (Select/MultiSelect)
  onEditOptions?: (
    fieldId: string, 
    updatedOptions: Array<{ id: string; name: string; color: string }>
  ) => Promise<void> | void;
  onManageColors?: (fieldId: string) => Promise<void> | void;
  
  // Type-specific Actions (Number)
  onSetFormat?: (fieldId: string, format: string) => Promise<void> | void;
  onShowAs?: (fieldId: string, display: string) => Promise<void> | void;
  
  // Type-specific Actions (Date)
  onDateFormat?: (fieldId: string, format: string) => Promise<void> | void;
  onTimeFormat?: (fieldId: string, format: string) => Promise<void> | void;
  onNotifications?: (fieldId: string) => Promise<void> | void;
  
  // Type-specific Actions (Title)
  onShowPageIcon?: (fieldId: string) => Promise<void> | void;
  
  // UI
  children?: React.ReactNode; // Trigger element
  align?: 'start' | 'center' | 'end';
  side?: 'top' | 'right' | 'bottom' | 'left';
  open?: boolean; // Controlled state
  onOpenChange?: (open: boolean) => void; // Controlled state handler
}

/**
 * Format Options for Different Property Types
 */
export interface NumberFormatOption {
  id: string;
  label: string;
  example: string;
  format: (value: number) => string;
}

export interface DateFormatOption {
  id: string;
  label: string;
  example: string;
  format: string; // date-fns format string
}

export interface AggregationOption {
  id: string;
  label: string;
  description: string;
  icon?: React.ComponentType<{ className?: string }>;
}
