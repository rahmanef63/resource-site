import { Hash, Percent, DollarSign, Euro, PoundSterling } from 'lucide-react';
import type {
  PropertyMenuExtension,
  PropertyMenuItem,
  PropertyMenuExtensionParams,
} from '../../components/PropertyMenu/types';

/**
 * Number Format Options
 */
export const NUMBER_FORMATS = [
  { id: 'number', label: 'Number', icon: Hash, example: '123' },
  { id: 'decimal', label: 'Decimal', icon: Hash, example: '123.45' },
  { id: 'percent', label: 'Percent', icon: Percent, example: '12%' },
  { id: 'currency-usd', label: 'US Dollar', icon: DollarSign, example: '$123' },
  { id: 'currency-eur', label: 'Euro', icon: Euro, example: '€123' },
  { id: 'currency-gbp', label: 'Pound', icon: PoundSterling, example: '£123' },
] as const;

/**
 * Number Aggregation Options
 */
export const NUMBER_AGGREGATIONS = [
  { id: 'sum', label: 'Sum', description: 'Add all values' },
  { id: 'avg', label: 'Average', description: 'Average of all values' },
  { id: 'median', label: 'Median', description: 'Middle value' },
  { id: 'min', label: 'Min', description: 'Smallest value' },
  { id: 'max', label: 'Max', description: 'Largest value' },
  { id: 'range', label: 'Range', description: 'Max - Min' },
] as const;

/**
 * Number Property Menu Extension
 */
export const numberPropertyMenuExtension: PropertyMenuExtension = {
  getMenuItems: ({ field, onAction }: PropertyMenuExtensionParams) => {
    const items: PropertyMenuItem[] = [];

    // Format submenu
    items.push({
      id: 'numberFormat',
      label: 'Number format',
      icon: Hash,
      submenu: NUMBER_FORMATS.map((format) => ({
        id: `format-${format.id}`,
        label: format.label,
        icon: format.icon,
        onClick: () => onAction?.('setFormat', format.id),
      })),
    });

    return items;
  },
};
