/**
 * Unified Icon System
 *
 * This module provides a comprehensive icon system with:
 * - Dynamic icon rendering (no static imports needed)
 * - Icon picker with categories and search
 * - Color picker with presets and custom colors
 * - Utility functions for icons and colors
 *
 * @example
 * // Import dynamic icon component
 * import { DynamicIcon } from "@/frontend/shared/ui/icons";
 * <DynamicIcon name="Home" className="h-4 w-4" />
 *
 * @example
 * // Import icon picker
 * import { IconPicker } from "@/frontend/shared/ui/icons";
 * <IconPicker icon={icon} onIconChange={setIcon} showColor showBackground />
 *
 * @example
 * // Import utilities
 * import { searchIcons, hexToRgb } from "@/frontend/shared/ui/icons";
 */

// Types
export type {
  IconName,
  IconData,
  IconCategory,
  ColorOption,
  DynamicIconProps,
  IconPickerProps,
  // ColorPickerProps, // Conflict with ui/color-picker
  IconGridProps,
  IconLookup,
} from "./types";

export { ICON_CATEGORIES } from "./types";

// Constants
export {
  ICONS_BY_CATEGORY,
  COMMON_ICONS,
  COLOR_PRESETS,
  BACKGROUND_PRESETS,
  FEATURE_ICONS,
  CATEGORY_ICONS,
  DEFAULT_ICON,
  DEFAULT_FEATURE_ICON,
  DEFAULT_CATEGORY_ICON,
} from "./constants";

// Dynamic Icon Component and utilities
export {
  DynamicIcon,
  FeatureIcon,
  CategoryIcon,
  getIconComponent,
  normalizeIconName,
  iconExists,
  getAllIconNames,
  getFeatureIconName,
  getCategoryIconName,
  // Legacy exports
  iconFromName,
  getFeatureIcon,
  getCategoryIcon,
} from "./dynamic-icon";

// Search utilities
export {
  searchIcons,
  getIconsByCategory,
  getAllIcons,
  getIconCategory,
  isIconInCategory,
  getRandomIcons,
  getSuggestedIcons,
  searchIconsInCategory,
} from "./search";

// Color utilities
export {
  getColorValue,
  isThemeColor,
  hexToRgb,
  rgbToHex,
  hexToHsl,
  hslToHex,
  lightenColor,
  darkenColor,
  getContrastColor,
  getColorsByGroup,
  isValidHexColor,
  ensureHexPrefix,
} from "./colors";

// Components
export { IconPicker, getIconStyle } from "./components/icon-picker";
export { IconGrid } from "./components/icon-grid";

// Color picker has been moved to frontend/shared/ui/color-picker
// import { InlineColorPicker, PresetColorPicker } from "@/frontend/shared/ui/color-picker";

// Re-export component props types
export type {
  IconPickerProps as IconPickerComponentProps,
  IconGridProps as IconGridComponentProps,
} from "./components";
