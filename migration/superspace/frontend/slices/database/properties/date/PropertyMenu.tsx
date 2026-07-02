import { Calendar, Clock } from 'lucide-react';
import type {
  PropertyMenuExtension,
  PropertyMenuItem,
  PropertyMenuExtensionParams,
} from '../../components/PropertyMenu/types';

/**
 * Date Format Options
 */
export const DATE_FORMATS = [
  { id: 'full', label: 'Full', example: 'November 5, 2025' },
  { id: 'long', label: 'Long', example: 'Nov 5, 2025' },
  { id: 'medium', label: 'Medium', example: '11/05/2025' },
  { id: 'short', label: 'Short', example: '11/5/25' },
  { id: 'relative', label: 'Relative', example: '2 days ago' },
  { id: 'iso', label: 'ISO', example: '2025-11-05' },
] as const;

/**
 * Date Property Menu Extension
 */
export const datePropertyMenuExtension: PropertyMenuExtension = {
  getMenuItems: ({ field, onAction }: PropertyMenuExtensionParams) => {
    const items: PropertyMenuItem[] = [];

    // Date format submenu
    items.push({
      id: 'dateFormat',
      label: 'Date format',
      icon: Calendar,
      submenu: DATE_FORMATS.map((format) => ({
        id: `format-${format.id}`,
        label: format.label,
        onClick: () => onAction?.('setFormat', format.id),
      })),
    });

    // Include time toggle
    items.push({
      id: 'includeTime',
      label: 'Include time',
      icon: Clock,
      onClick: () => onAction?.('toggleTime'),
    });

    return items;
  },
};
