import * as LucideIcons from 'lucide-react';
import { getIconComponent, getCategoryIconName, DEFAULT_ICON } from '@/frontend/shared/ui/icons';

/**
 * Standard icon mapping for CMS widgets
 * Ensures consistent icon usage across all widgets
 */

export type IconType = React.ComponentType<any> | string | keyof typeof LucideIcons;

/**
 * Widget category to icon mapping
 */
export const categoryIcons = {
  Layout: 'Layout',
  Content: 'Type',
  Media: 'Image',
  Navigation: 'Menu',
  Action: 'MousePointerClick',
  UI: 'Component',
  Templates: 'LayoutTemplate',
} as const;

/**
 * Widget-specific icon overrides
 */
export const widgetIcons = {
  // Layout
  section: 'PanelTop',
  container: 'Box',
  row: 'Rows',
  column: 'Columns',
  threeColumn: 'Columns3',
  twoColumn: 'Columns2',
  grid: 'LayoutGrid',
  flex: 'MoveHorizontal',

  // Content
  text: 'Type',
  card: 'Square',
  heading: 'Heading',
  paragraph: 'AlignLeft',

  // Media
  image: 'Image',
  video: 'Video',
  audio: 'Music',
  gallery: 'Images',

  // Navigation
  navGroup: 'Menu',
  breadcrumb: 'ChevronRight',
  pagination: 'MoreHorizontal',

  // Action
  button: 'MousePointerClick',
  link: 'Link',
  form: 'FileText',

  // UI Components
  accordion: 'ChevronDown',
  alert: 'AlertCircle',
  avatar: 'User',
  badge: 'Tag',
  checkbox: 'Check',
  progress: 'TrendingUp',
  radioGroup: 'Circle',
  scrollArea: 'Scroll',
  skeleton: 'Loader',
  table: 'Table',
  textarea: 'AlignLeft',
  toggleGroup: 'ToggleLeft',
  aspectRatio: 'Crop',
  tabs: 'Layers',
  separator: 'Minus',
  tooltip: 'MessageCircle',
  collapsible: 'ChevronsUpDown',
  carousel: 'GalleryHorizontal',
  dialog: 'MessageSquare',
  hoverCard: 'RectangleHorizontal',

  // Templates
  hero: 'LayoutTemplate',
  heroComposite: 'Layers',
} as const;

/**
 * Resolves an icon to a consistent format
 * @param icon - The icon identifier (string, component, or undefined)
 * @param fallbackCategory - Fallback category for default icon
 * @param widgetKey - Widget key for specific icon lookup
 * @returns Resolved icon component or string
 */
export const resolveWidgetIcon = (
  icon: IconType | undefined,
  fallbackCategory?: keyof typeof categoryIcons,
  widgetKey?: keyof typeof widgetIcons
): React.ComponentType<any> | string => {
  // If icon is provided and valid, use it
  if (icon) {
    // If it's already a component, return it
    if (typeof icon !== 'string') {
      return icon;
    }

    // If it's a string that matches a Lucide icon, return the component
    if (icon in LucideIcons) {
      return (LucideIcons as any)[icon];
    }

    // Return the string as-is (for custom icons)
    return icon;
  }

  // Try to get widget-specific icon
  if (widgetKey && widgetKey in widgetIcons) {
    const iconName = widgetIcons[widgetKey];
    if (iconName in LucideIcons) {
      return (LucideIcons as any)[iconName];
    }
    return iconName;
  }

  // Try to get category icon
  if (fallbackCategory && fallbackCategory in categoryIcons) {
    const iconName = categoryIcons[fallbackCategory];
    if (iconName in LucideIcons) {
      return (LucideIcons as any)[iconName];
    }
    return iconName;
  }

  // Last resort: use shared icon utility
  const sharedIcon = getIconComponent(getCategoryIconName(fallbackCategory || 'UI'));
  if (sharedIcon) return sharedIcon;

  // Final fallback: use Lucide Component icon
  return (LucideIcons as any).Component || 'Component';
};

/**
 * Gets the standard icon for a widget category
 * @param category - Widget category
 * @returns Standard icon for the category
 */
export const getCategoryStandardIcon = (category: keyof typeof categoryIcons): React.ComponentType<any> => {
  const iconName = categoryIcons[category];
  if (iconName in LucideIcons) {
    return (LucideIcons as any)[iconName];
  }
  const sharedIcon = getIconComponent(getCategoryIconName(category));
  if (sharedIcon) return sharedIcon;
  return (LucideIcons as any).Component;
};

/**
 * Validates if an icon string is a valid Lucide icon
 * @param iconName - Icon name to validate
 * @returns Whether the icon is valid
 */
export const isValidLucideIcon = (iconName: string): boolean => {
  return iconName in LucideIcons;
};

/**
 * Gets all available Lucide icon names
 * @returns Array of icon names
 */
export const getAvailableIcons = (): string[] => {
  return Object.keys(LucideIcons).filter(key => key !== 'createLucideIcon');
};
