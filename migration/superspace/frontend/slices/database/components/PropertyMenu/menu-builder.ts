/**
 * Property Menu Builder
 * 
 * Builds complete menu configuration by combining:
 * - BASE_MENU_ITEMS (15 common actions)
 * - Property type-specific config from registry
 * - Overrides for customized base items
 * - Hidden/disabled rules
 */

import type { PropertyMenuItem } from './types';
import { BASE_MENU_ITEMS } from './menu-config';
import { getPropertyMenuConfig } from '../../properties/menu-registry';
import type { Property } from '@/frontend/shared/foundation/types/universal-database';
import type { DatabaseField } from '../../types';
import { buildOptionMenuItems } from '../shared/OptionActionsMenu';
import { Plus } from 'lucide-react';

/**
 * Build complete menu for a property
 * 
 * Process:
 * 1. Get base menu items (15 actions)
 * 2. Get property type config from registry
 * 3. Apply overrides (modify base items)
 * 4. Add type-specific items
 * 5. Apply hidden/disabled rules
 * 6. Organize into sections
 * 
 * @param field - Property or DatabaseField
 * @param callbacks - Action handler callbacks
 * @returns Array of menu items ready to render
 */
export function buildPropertyMenu(
  field: Property | DatabaseField,
  callbacks: PropertyMenuCallbacks
): PropertyMenuItem[] {
  // Get property type
  const propertyType = 'type' in field ? field.type : (field as any).fieldType || 'text';
  
  // Get type-specific config from registry
  const config = getPropertyMenuConfig(propertyType);
  
  // Start with base menu items
  const menuItems: PropertyMenuItem[] = [];
  
  // Build sections
  const sections: Array<{ id: string; items: PropertyMenuItem[] }> = [
    { id: 'edit', items: buildEditSection(config, callbacks) },
    { id: 'typeSpecific', items: buildTypeSpecificSection(config, callbacks, field) },
    { id: 'data', items: buildDataSection(config, callbacks) },
    { id: 'column', items: buildColumnSection(config, callbacks) },
    { id: 'settings', items: buildSettingsSection(config, callbacks) },
    { id: 'danger', items: buildDangerSection(config, callbacks) },
  ];
  
  // Combine sections with separators
  sections.forEach((section, index) => {
    if (section.items.length > 0) {
      menuItems.push(...section.items);
      
      // Add separator if not last section
      if (index < sections.length - 1) {
        menuItems.push({
          id: `separator-${section.id}`,
          label: '',
          separator: true,
        });
      }
    }
  });
  
  return menuItems;
}

/**
 * Edit Section: rename, duplicate
 */
function buildEditSection(config: any, callbacks: PropertyMenuCallbacks): PropertyMenuItem[] {
  const items: PropertyMenuItem[] = [];
  
  // Rename
  if (!config.hidden.includes('rename')) {
    items.push({
      ...BASE_MENU_ITEMS.rename,
      onClick: callbacks.onRename,
      disabled: config.disabled.includes('rename'),
    });
  }
  
  // Duplicate
  if (!config.hidden.includes('duplicate')) {
    items.push({
      ...BASE_MENU_ITEMS.duplicate,
      onClick: callbacks.onDuplicate,
      disabled: config.disabled.includes('duplicate'),
    });
  }
  
  // Change Type
  if (!config.hidden.includes('changeType')) {
    items.push({
      ...BASE_MENU_ITEMS.changeType,
      onClick: callbacks.onChangeType,
      disabled: config.disabled.includes('changeType'),
    });
  }
  
  return items;
}

/**
 * Type-Specific Section: property-specific menu items
 */
function buildTypeSpecificSection(
  config: any, 
  callbacks: PropertyMenuCallbacks, 
  field: Property | DatabaseField
): PropertyMenuItem[] {
  const items: PropertyMenuItem[] = [];
  
  // Add type-specific items from config
  if (config.typeSpecificItems && config.typeSpecificItems.length > 0) {
    config.typeSpecificItems.forEach((item: any) => {
      // Build submenu if present
      let submenu: PropertyMenuItem[] | undefined;
      
      // Check if submenu is 'combobox' - use combobox instead of nested submenu
      if (item.submenu === 'combobox' && item.id === 'editOptions') {
        // PropertyMenu will render OptionsCombobox for this item
        // Just pass through without building nested submenu
        items.push({
          id: item.id,
          label: item.label,
          icon: item.icon,
          shortcut: item.shortcut,
          submenu: 'combobox', // Flag for PropertyMenu to render combobox
        });
        return; // Skip the rest of the loop for this item
      }
      
      // Check if submenu is 'dynamic' - build from field data (deprecated)
      if (item.submenu === 'dynamic' && item.id === 'editOptions') {
        // Build options submenu from field.options
        const fieldOptions = (field as any).options;
        const choices = fieldOptions?.choices || fieldOptions?.selectOptions || [];
        
        // Use reusable helper to build option menu items
        submenu = choices.map((choice: any) => ({
          id: `option-${choice.id || choice.name}`,
          label: choice.name,
          icon: undefined,
          badge: {
            color: choice.color,
            text: choice.name,
          },
          // Build nested submenu using reusable helper
          submenu: buildOptionMenuItems(choice, {
            onRename: (optionId) => callbacks.onEditOption?.(optionId),
            onDelete: (optionId) => callbacks.onDeleteOption?.(optionId),
            onChangeColor: (optionId, color) => callbacks.onChangeOptionColor?.(optionId, color),
          }),
        }));
        
        // Add "Add option" at the end  
        if (submenu) {
          submenu.push({
            id: 'add-option',
            label: 'Add option',
            icon: Plus,
            onClick: () => {
              if (callbacks.onAddOption) {
                callbacks.onAddOption();
              }
            },
          });
        }
      } else if (item.submenu && Array.isArray(item.submenu)) {
        // Static submenu
        submenu = item.submenu.map((subItem: any) => ({
          id: subItem.id || subItem.label,
          label: subItem.label,
          icon: subItem.icon,
          onClick: () => {
            // Call appropriate callback based on parent item
            if (item.id === 'setFormat' && callbacks.onSetFormat) {
              callbacks.onSetFormat(subItem.value || subItem.label);
            } else if (item.id === 'showAs' && callbacks.onShowAs) {
              callbacks.onShowAs(subItem.value || subItem.label);
            } else if (item.id === 'dateFormat' && callbacks.onDateFormat) {
              callbacks.onDateFormat(subItem.value || subItem.label);
            } else if (item.id === 'timeFormat' && callbacks.onTimeFormat) {
              callbacks.onTimeFormat(subItem.value || subItem.label);
            }
          },
        }));
      }
      
      items.push({
        id: item.id,
        label: item.label,
        icon: item.icon,
        submenu,
        onClick: item.onClick || (() => {
          // Default onClick for items without submenu
          if (item.id === 'editOptions' && callbacks.onEditOptions) {
            callbacks.onEditOptions();
          } else if (item.id === 'manageColors' && callbacks.onManageColors) {
            callbacks.onManageColors();
          } else if (item.id === 'showPageIcon' && callbacks.onShowPageIcon) {
            callbacks.onShowPageIcon();
          } else if (item.id === 'notifications' && callbacks.onNotifications) {
            callbacks.onNotifications();
          }
        }),
      });
    });
  }
  
  return items;
}

/**
 * Data Section: sort, filter, calculate
 */
function buildDataSection(config: any, callbacks: PropertyMenuCallbacks): PropertyMenuItem[] {
  const items: PropertyMenuItem[] = [];
  
  // Sort Ascending
  if (!config.hidden.includes('sortAsc')) {
    items.push({
      ...BASE_MENU_ITEMS.sortAsc,
      onClick: () => callbacks.onSort?.('asc'),
      disabled: config.disabled.includes('sortAsc'),
    });
  }
  
  // Sort Descending
  if (!config.hidden.includes('sortDesc')) {
    items.push({
      ...BASE_MENU_ITEMS.sortDesc,
      onClick: () => callbacks.onSort?.('desc'),
      disabled: config.disabled.includes('sortDesc'),
    });
  }
  
  // Filter
  if (!config.hidden.includes('filter')) {
    items.push({
      ...BASE_MENU_ITEMS.filter,
      onClick: callbacks.onFilter,
      disabled: config.disabled.includes('filter'),
    });
  }
  
  // Calculate (with overrides if present)
  if (!config.hidden.includes('calculate')) {
    const calculateItem = { ...BASE_MENU_ITEMS.calculate };
    
    // Apply overrides from property type config
    if (config.overrides?.calculate) {
      if (config.overrides.calculate.submenu) {
        calculateItem.submenu = config.overrides.calculate.submenu.map((item: any) => ({
          id: item.id,
          label: item.label,
          icon: item.icon,
          onClick: () => callbacks.onCalculate?.(item.label),
        }));
      }
    } else {
      // Default submenu
      calculateItem.submenu = [
        { id: 'calculate-count', label: 'Count all', onClick: () => callbacks.onCalculate?.('Count all') },
        { id: 'calculate-count-values', label: 'Count values', onClick: () => callbacks.onCalculate?.('Count values') },
        { id: 'calculate-count-unique', label: 'Count unique values', onClick: () => callbacks.onCalculate?.('Count unique values') },
        { id: 'calculate-count-empty', label: 'Count empty', onClick: () => callbacks.onCalculate?.('Count empty') },
        { id: 'calculate-count-not-empty', label: 'Count not empty', onClick: () => callbacks.onCalculate?.('Count not empty') },
        { id: 'calculate-percent-empty', label: 'Percent empty', onClick: () => callbacks.onCalculate?.('Percent empty') },
        { id: 'calculate-percent-not-empty', label: 'Percent not empty', onClick: () => callbacks.onCalculate?.('Percent not empty') },
      ];
    }
    
    items.push({
      ...calculateItem,
      disabled: config.disabled.includes('calculate'),
    });
  }
  
  // Wrap Column
  if (!config.hidden.includes('wrap')) {
    items.push({
      ...BASE_MENU_ITEMS.wrap,
      onClick: callbacks.onWrap,
      disabled: config.disabled.includes('wrap'),
    });
  }
  
  return items;
}

/**
 * Column Section: insert, move
 */
function buildColumnSection(config: any, callbacks: PropertyMenuCallbacks): PropertyMenuItem[] {
  const items: PropertyMenuItem[] = [];
  
  // Insert Left
  if (!config.hidden.includes('insertLeft')) {
    items.push({
      ...BASE_MENU_ITEMS.insertLeft,
      onClick: callbacks.onInsertLeft,
      disabled: config.disabled.includes('insertLeft'),
    });
  }
  
  // Insert Right
  if (!config.hidden.includes('insertRight')) {
    items.push({
      ...BASE_MENU_ITEMS.insertRight,
      onClick: callbacks.onInsertRight,
      disabled: config.disabled.includes('insertRight'),
    });
  }
  
  // Move Left
  if (!config.hidden.includes('moveLeft')) {
    items.push({
      ...BASE_MENU_ITEMS.moveLeft,
      onClick: callbacks.onMoveLeft,
      disabled: config.disabled.includes('moveLeft'),
    });
  }
  
  // Move Right
  if (!config.hidden.includes('moveRight')) {
    items.push({
      ...BASE_MENU_ITEMS.moveRight,
      onClick: callbacks.onMoveRight,
      disabled: config.disabled.includes('moveRight'),
    });
  }
  
  return items;
}

/**
 * Settings Section: toggle required, hide
 */
function buildSettingsSection(config: any, callbacks: PropertyMenuCallbacks): PropertyMenuItem[] {
  const items: PropertyMenuItem[] = [];
  
  // Toggle Required
  if (!config.hidden.includes('toggleRequired')) {
    items.push({
      ...BASE_MENU_ITEMS.toggleRequired,
      onClick: callbacks.onToggleRequired,
      disabled: config.disabled.includes('toggleRequired'),
    });
  }
  
  // Hide Column
  if (!config.hidden.includes('hide')) {
    items.push({
      ...BASE_MENU_ITEMS.hide,
      onClick: callbacks.onHide,
      disabled: config.disabled.includes('hide'),
    });
  }
  
  return items;
}

/**
 * Danger Section: delete
 */
function buildDangerSection(config: any, callbacks: PropertyMenuCallbacks): PropertyMenuItem[] {
  const items: PropertyMenuItem[] = [];
  
  // Delete
  if (!config.hidden.includes('delete')) {
    items.push({
      ...BASE_MENU_ITEMS.delete,
      onClick: callbacks.onDelete,
      disabled: config.disabled.includes('delete'),
    });
  }
  
  return items;
}

/**
 * Callback interface for menu actions
 */
export interface PropertyMenuCallbacks {
  // Common actions
  onRename?: () => void;
  onDuplicate?: () => void;
  onChangeType?: () => void;
  onHide?: () => void;
  onDelete?: () => void;
  onToggleRequired?: () => void;
  
  // Column actions
  onInsertLeft?: () => void;
  onInsertRight?: () => void;
  onMoveLeft?: () => void;
  onMoveRight?: () => void;
  
  // Data actions
  onSort?: (direction: 'asc' | 'desc') => void;
  onFilter?: () => void;
  onCalculate?: (aggregation: string) => void;
  onWrap?: () => void;
  
  // Type-specific actions
  onEditOptions?: () => void;
  onEditOption?: (optionId: string) => void;
  onAddOption?: () => void;
  onDeleteOption?: (optionId: string) => void;
  onChangeOptionColor?: (optionId: string, color: string) => void;
  onManageColors?: () => void;
  onSetFormat?: (format: string) => void;
  onShowAs?: (display: string) => void;
  onDateFormat?: (format: string) => void;
  onTimeFormat?: (format: string) => void;
  onNotifications?: () => void;
  onShowPageIcon?: () => void;
}
