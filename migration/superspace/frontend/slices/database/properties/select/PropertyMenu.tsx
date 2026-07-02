import { Tags, Settings } from 'lucide-react';
import type {
  PropertyMenuExtension,
  PropertyMenuItem,
  PropertyMenuExtensionParams,
} from '../../components/PropertyMenu/types';

/**
 * Select Property Menu Extension
 */
export const selectPropertyMenuExtension: PropertyMenuExtension = {
  getMenuItems: ({ field, onAction }: PropertyMenuExtensionParams) => {
    const items: PropertyMenuItem[] = [];

    // Edit options
    items.push({
      id: 'editOptions',
      label: 'Edit options',
      icon: Tags,
      onClick: () => onAction?.('editOptions'),
    });

    // Show page icon (if applicable)
    items.push({
      id: 'showPageIcon',
      label: 'Show page icon',
      icon: Settings,
      onClick: () => onAction?.('togglePageIcon'),
    });

    return items;
  },
};
