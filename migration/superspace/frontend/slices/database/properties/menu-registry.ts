/**
 * Property Menu Configuration Registry
 * 
 * Central registry for all property type menu configurations
 */

import type { PropertyTypeMenuConfig } from '../components/PropertyMenu/menu-config';
import { DEFAULT_PROPERTY_MENU_CONFIG } from '../components/PropertyMenu/menu-config';

// Import all property menu configs
import { selectPropertyMenuConfig } from './select/menu-config';
import { multiSelectPropertyMenuConfig } from './multi_select/menu-config';
import { statusPropertyMenuConfig } from './status/menu-config';
import { numberPropertyMenuConfig } from './number/menu-config';
import { datePropertyMenuConfig } from './date/menu-config';
import { titlePropertyMenuConfig } from './title/menu-config';
import { richTextPropertyMenuConfig } from './rich_text/menu-config';
import { checkboxPropertyMenuConfig } from './checkbox/menu-config';
import { createdTimePropertyMenuConfig } from './created_time/menu-config';
import { createdByPropertyMenuConfig } from './created_by/menu-config';
import { lastEditedTimePropertyMenuConfig } from './last_edited_time/menu-config';
import { lastEditedByPropertyMenuConfig } from './last_edited_by/menu-config';
import { peoplePropertyMenuConfig } from './people/menu-config';
import { urlPropertyMenuConfig } from './url/menu-config';
import { emailPropertyMenuConfig } from './email/menu-config';
import { phonePropertyMenuConfig } from './phone/menu-config';
import { filesPropertyMenuConfig } from './files/menu-config';
import { placePropertyMenuConfig } from './place/menu-config';
import { uniqueIdPropertyMenuConfig } from './unique_id/menu-config';
import { formulaPropertyMenuConfig } from './formula/menu-config';
import { rollupPropertyMenuConfig } from './rollup/menu-config';
import { relationPropertyMenuConfig } from './relation/menu-config';
import { buttonPropertyMenuConfig } from './button/menu-config';

/**
 * Property Type to Menu Config Mapping
 * 
 * All 20+ property types now have dedicated menu-config.ts files
 * imported and registered here for clean, maintainable code.
 */
export const PROPERTY_MENU_REGISTRY: Record<string, PropertyTypeMenuConfig> = {
  // Text types
  title: titlePropertyMenuConfig,
  rich_text: richTextPropertyMenuConfig,
  text: richTextPropertyMenuConfig, // Legacy fallback, use rich_text instead
  
  // Number types
  number: numberPropertyMenuConfig,
  
  // Select types
  select: selectPropertyMenuConfig,
  multi_select: multiSelectPropertyMenuConfig,
  status: statusPropertyMenuConfig,
  
  // Date types
  date: datePropertyMenuConfig,
  
  // Boolean types
  checkbox: checkboxPropertyMenuConfig,
  
  // Auto properties
  created_time: createdTimePropertyMenuConfig,
  created_by: createdByPropertyMenuConfig,
  last_edited_time: lastEditedTimePropertyMenuConfig,
  last_edited_by: lastEditedByPropertyMenuConfig,
  
  // People
  people: peoplePropertyMenuConfig,
  
  // Contact types
  url: urlPropertyMenuConfig,
  email: emailPropertyMenuConfig,
  phone: phonePropertyMenuConfig,
  
  // Files & Location
  files: filesPropertyMenuConfig,
  place: placePropertyMenuConfig,
  
  // Advanced types
  formula: formulaPropertyMenuConfig,
  rollup: rollupPropertyMenuConfig,
  relation: relationPropertyMenuConfig,
  unique_id: uniqueIdPropertyMenuConfig,
  button: buttonPropertyMenuConfig,
};

/**
 * Get menu configuration for a property type
 */
export function getPropertyMenuConfig(propertyType: string): PropertyTypeMenuConfig {
  return PROPERTY_MENU_REGISTRY[propertyType] || DEFAULT_PROPERTY_MENU_CONFIG;
}

/**
 * Check if a menu item should be visible for a property type
 */
export function isMenuItemVisible(
  propertyType: string,
  menuItemId: string
): boolean {
  const config = getPropertyMenuConfig(propertyType);
  return !config.hidden?.includes(menuItemId as any);
}

/**
 * Check if a menu item should be disabled for a property type
 */
export function isMenuItemDisabled(
  propertyType: string,
  menuItemId: string
): boolean {
  const config = getPropertyMenuConfig(propertyType);
  return config.disabled?.includes(menuItemId as any) ?? false;
}
