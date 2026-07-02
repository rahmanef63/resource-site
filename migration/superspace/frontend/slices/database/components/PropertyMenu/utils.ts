import {
  Type,
  Edit3,
  Copy,
  EyeOff,
  Trash2,
  CheckSquare,
  Settings,
  ArrowUpAZ,
  ArrowDownZA,
  Filter as FilterIcon,
  Calculator,
  WrapText,
  ArrowLeft,
  ArrowRight,
  ArrowBigLeft,
  ArrowBigRight,
} from 'lucide-react';
import type { PropertyMenuItem, PropertyMenuAction } from './types';
import type { DatabaseField } from '../../types';
import type { Property } from '@/frontend/shared/foundation/types/universal-database';

/**
 * Get common property menu items
 */
export function getCommonMenuItems(params: {
  field: DatabaseField | Property;
  isVisible?: boolean;
  isRequired?: boolean;
  onRename?: (fieldId: string, name: string) => void;
  onDuplicate?: (fieldId: string) => void;
  onHide?: (fieldId: string) => void;
  onDelete?: (fieldId: string) => void;
  onToggleRequired?: (fieldId: string, required: boolean) => void;
  onInsertLeft?: (fieldId: string) => void;
  onInsertRight?: (fieldId: string) => void;
  onMoveLeft?: (fieldId: string) => void;
  onMoveRight?: (fieldId: string) => void;
  onSort?: (fieldId: string, direction: 'asc' | 'desc') => void;
  onFilter?: (fieldId: string) => void;
  onCalculate?: (fieldId: string, aggregation: string) => void;
}): PropertyMenuItem[] {
  const fieldId = 'key' in params.field ? params.field.key : String(params.field._id);
  const fieldName = params.field.name;
  const items: PropertyMenuItem[] = [];

  // Edit Section
  if (params.onRename) {
    items.push({
      id: 'rename',
      label: 'Rename',
      icon: Edit3,
      shortcut: '⌘R',
      onClick: () => {
        const newName = prompt('Enter new name:', fieldName);
        if (newName && newName.trim()) {
          params.onRename!(fieldId, newName.trim());
        }
      },
    });
  }

  if (params.onDuplicate) {
    items.push({
      id: 'duplicate',
      label: 'Duplicate',
      icon: Copy,
      onClick: () => params.onDuplicate!(fieldId),
    });
  }

  // Separator after edit actions
  if (items.length > 0) {
    items.push({ id: 'separator-1', label: '', separator: true });
  }

  // Data Actions Section
  if (params.onSort) {
    items.push({
      id: 'sortAsc',
      label: 'Sort ascending',
      icon: ArrowUpAZ,
      shortcut: 'A → Z',
      onClick: () => params.onSort!(fieldId, 'asc'),
    });
    items.push({
      id: 'sortDesc',
      label: 'Sort descending',
      icon: ArrowDownZA,
      shortcut: 'Z → A',
      onClick: () => params.onSort!(fieldId, 'desc'),
    });
  }

  if (params.onFilter) {
    items.push({
      id: 'filter',
      label: 'Filter',
      icon: FilterIcon,
      onClick: () => params.onFilter!(fieldId),
    });
  }

  if (params.onCalculate) {
    items.push({
      id: 'calculate',
      label: 'Calculate',
      icon: Calculator,
      submenu: [
        {
          id: 'calculate-count',
          label: 'Count all',
          onClick: () => params.onCalculate!(fieldId, 'count'),
        },
        {
          id: 'calculate-count-values',
          label: 'Count values',
          onClick: () => params.onCalculate!(fieldId, 'count-values'),
        },
        {
          id: 'calculate-count-unique',
          label: 'Count unique values',
          onClick: () => params.onCalculate!(fieldId, 'count-unique'),
        },
        {
          id: 'calculate-count-empty',
          label: 'Count empty',
          onClick: () => params.onCalculate!(fieldId, 'count-empty'),
        },
        {
          id: 'calculate-percent-empty',
          label: 'Percent empty',
          onClick: () => params.onCalculate!(fieldId, 'percent-empty'),
        },
      ],
    });
  }

  // Separator after data actions
  if (params.onSort || params.onFilter || params.onCalculate) {
    items.push({ id: 'separator-2', label: '', separator: true });
  }

  // Column Management Section
  if (params.onInsertLeft) {
    items.push({
      id: 'insertLeft',
      label: 'Insert left',
      icon: ArrowLeft,
      onClick: () => params.onInsertLeft!(fieldId),
    });
  }

  if (params.onInsertRight) {
    items.push({
      id: 'insertRight',
      label: 'Insert right',
      icon: ArrowRight,
      onClick: () => params.onInsertRight!(fieldId),
    });
  }

  if (params.onMoveLeft) {
    items.push({
      id: 'moveLeft',
      label: 'Move left',
      icon: ArrowBigLeft,
      onClick: () => params.onMoveLeft!(fieldId),
    });
  }

  if (params.onMoveRight) {
    items.push({
      id: 'moveRight',
      label: 'Move right',
      icon: ArrowBigRight,
      onClick: () => params.onMoveRight!(fieldId),
    });
  }

  // Separator before danger zone
  if (items.length > 0) {
    items.push({ id: 'separator-3', label: '', separator: true });
  }

  // Property Settings
  if (params.onToggleRequired) {
    items.push({
      id: 'toggleRequired',
      label: params.isRequired ? 'Make optional' : 'Make required',
      icon: CheckSquare,
      onClick: () => params.onToggleRequired!(fieldId, !params.isRequired),
    });
  }

  // Danger Zone
  if (params.onHide) {
    items.push({
      id: 'hide',
      label: 'Hide in view',
      icon: EyeOff,
      onClick: () => params.onHide!(fieldId),
    });
  }

  if (params.onDelete) {
    items.push({
      id: 'delete',
      label: 'Delete property',
      icon: Trash2,
      variant: 'danger',
      onClick: () => {
        if (confirm(`Are you sure you want to delete "${fieldName}"?`)) {
          params.onDelete!(fieldId);
        }
      },
    });
  }

  return items;
}

/**
 * Filter menu items by conditions
 */
export function filterMenuItems(
  items: PropertyMenuItem[],
  condition: (item: PropertyMenuItem) => boolean
): PropertyMenuItem[] {
  return items.filter(condition).filter((item) => !item.hidden);
}

/**
 * Get field ID from DatabaseField or Property
 */
export function getFieldId(field: DatabaseField | Property): string {
  return 'key' in field ? field.key : String(field._id);
}
