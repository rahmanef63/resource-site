import type { LucideIcon, LucideProps } from "lucide-react";

/**
 * Icon name as a string identifier
 * @example "Home", "Settings", "User"
 */
export type IconName = string;

/**
 * Icon data structure for icon picker and grid
 */
export interface IconData {
  name: IconName;
  component: LucideIcon;
  category: IconCategory;
  keywords?: string[];
}

/**
 * Available icon categories
 */
export const ICON_CATEGORIES = [
  "all",
  "common",
  "files",
  "arrows",
  "communication",
  "media",
  "design",
  "development",
  "business",
  "social",
  "navigation",
  "actions",
  "status",
  "shapes",
] as const;

export type IconCategory = (typeof ICON_CATEGORIES)[number];

/**
 * Color option for color picker
 */
export interface ColorOption {
  value: string;
  label: string;
  group?: string;
}

/**
 * Props for DynamicIcon component
 */
export interface DynamicIconProps extends Omit<LucideProps, "ref"> {
  /** Icon name as string (e.g., "Home", "Settings") */
  name: IconName;
  /** Fallback icon name if the specified icon is not found */
  fallback?: IconName;
}

/**
 * Props for IconPicker component
 */
export interface IconPickerProps {
  /** Currently selected icon name */
  value?: IconName;
  /** Callback when icon is selected */
  onChange?: (iconName: IconName) => void;
  /** Filter icons by category */
  category?: IconCategory;
  /** Placeholder text for search */
  searchPlaceholder?: string;
  /** Custom class for the trigger button */
  triggerClassName?: string;
  /** Custom class for the content popover */
  contentClassName?: string;
  /** Whether the picker is disabled */
  disabled?: boolean;
}

/**
 * Props for ColorPicker component
 */
export interface ColorPickerProps {
  /** Currently selected color value */
  value?: string;
  /** Callback when color is selected */
  onChange?: (color: string) => void;
  /** Show custom color input */
  showCustomInput?: boolean;
  /** Preset colors to show */
  presets?: ColorOption[];
  /** Custom class for the trigger button */
  triggerClassName?: string;
  /** Custom class for the content popover */
  contentClassName?: string;
  /** Whether the picker is disabled */
  disabled?: boolean;
}

/**
 * Props for IconGrid component
 */
export interface IconGridProps {
  /** Icons to display */
  icons: IconName[];
  /** Currently selected icon */
  selectedIcon?: IconName;
  /** Callback when icon is clicked */
  onSelect?: (iconName: IconName) => void;
  /** Icon size */
  iconSize?: number;
  /** Grid columns */
  columns?: number;
  /** Custom class for the grid */
  className?: string;
}

/**
 * Icon lookup map type
 */
export type IconLookup = Record<string, LucideIcon>;
