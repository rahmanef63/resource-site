/**
 * usePropertyMenuHandlers Hook
 * 
 * Provides complete set of handlers for PropertyMenu actions.
 * Connects PropertyMenu UI interactions to Convex mutations.
 * 
 * This hook bridges the gap between table view components and database mutations,
 * ensuring consistent behavior across all views (table, kanban, calendar, etc).
 */

import { useCallback } from 'react';
import type { Id } from '@convex/_generated/dataModel';
import { useDatabaseMutations } from '../../hooks/useDatabase';
import type { DatabaseField, DatabaseView } from '../../types';

export interface UsePropertyMenuHandlersProps {
  tableId: Id<"dbTables">;
  fields: DatabaseField[];
  activeView?: DatabaseView | null;
}

export interface PropertyMenuHandlers {
  // Edit section
  onRename: (fieldId: string, name: string) => Promise<void>;
  onDuplicate: (fieldId: string) => Promise<void>;
  onChangeType: (fieldId: string, newType: any) => Promise<void>;
  
  // Data section
  onSort: (fieldId: string, direction: 'asc' | 'desc') => void;
  onFilter: (fieldId: string) => void;
  onCalculate: (fieldId: string, calcType: string) => void;
  onWrap: (fieldId: string) => void;
  
  // Type-specific section
  onSetFormat: (fieldId: string, format: string) => Promise<void>;
  onShowAs: (fieldId: string, displayType: string) => Promise<void>;
  onDateFormat: (fieldId: string, format: string) => Promise<void>;
  onTimeFormat: (fieldId: string, format: string) => Promise<void>;
  onEditOptions: (
    fieldId: string, 
    updatedOptions: Array<{ id: string; name: string; color: string }>
  ) => Promise<void>;
  onManageColors: (fieldId: string) => void;
  onNotifications: (fieldId: string) => void;
  onShowPageIcon: (fieldId: string) => void;
  
  // Column section (Insert/Move)
  onInsertLeft: (fieldId: string) => Promise<void>;
  onInsertRight: (fieldId: string) => Promise<void>;
  onMoveLeft: (fieldId: string) => Promise<void>;
  onMoveRight: (fieldId: string) => Promise<void>;
  
  // Settings section
  onToggleRequired: (fieldId: string, required: boolean) => Promise<void>;
  onHide: (fieldId: string) => Promise<void>;
  
  // Danger section
  onDelete: (fieldId: string) => Promise<void>;
}

/**
 * Hook to create PropertyMenu handlers
 */
export function usePropertyMenuHandlers({
  tableId,
  fields,
  activeView,
}: UsePropertyMenuHandlersProps): PropertyMenuHandlers {
  const {
    createField,
    updateField,
    deleteField,
    reorderField,
    updateView,
    changeFieldType,
  } = useDatabaseMutations();

  // Edit Section: Rename Property
  const onRename = useCallback(async (fieldId: string, name: string) => {
    await updateField({
      id: fieldId as Id<"dbFields">,
      name,
    });
  }, [updateField]);

  // Edit Section: Duplicate Property
  const onDuplicate = useCallback(async (fieldId: string) => {
    const field = fields.find(f => String(f._id) === fieldId);
    if (!field) throw new Error('Field not found');

    // Get next position (after this field)
    const currentIndex = fields.findIndex(f => String(f._id) === fieldId);
    const nextPosition = currentIndex + 1.5; // Place between current and next

    await createField({
      tableId,
      name: `${field.name} (copy)`,
      type: field.type,
      options: field.options,
      isRequired: field.isRequired ?? false,
    });
  }, [fields, tableId, createField]);

  // Edit Section: Change Property Type
  const onChangeType = useCallback(async (fieldId: string, newType: any) => {
    const field = fields.find(f => String(f._id) === fieldId);
    if (!field) throw new Error('Field not found');

    // Use the new changeFieldType mutation that handles data transformation
    // This mutation will:
    // 1. Update the field type
    // 2. Transform all existing row values from old type to new type
    // 3. Save transformed values back to database
    await changeFieldType({
      fieldId: fieldId as Id<"dbFields">,
      newType: newType,
      transformData: true,
    });
  }, [fields, changeFieldType]);

  // Data Section: Sort
  const onSort = useCallback((fieldId: string, direction: 'asc' | 'desc') => {
    if (!activeView) {
      console.warn('No active view for sort');
      return;
    }

    // TODO: Implement sort update in view settings
  }, [activeView]);

  // Data Section: Filter
  const onFilter = useCallback((fieldId: string) => {
    // TODO: Open filter modal
  }, []);

  // Data Section: Calculate
  const onCalculate = useCallback((fieldId: string, calcType: string) => {
    // TODO: Update view aggregation settings
  }, []);

  // Data Section: Wrap
  const onWrap = useCallback((fieldId: string) => {
    // TODO: Toggle text wrapping in view settings
  }, []);

  // Type-Specific: Set Format (Number)
  const onSetFormat = useCallback(async (fieldId: string, format: string) => {
    await updateField({
      id: fieldId as Id<"dbFields">,
      options: { numberFormat: format } as any,
    });
  }, [updateField]);

  // Type-Specific: Show As (Number - bar, ring)
  const onShowAs = useCallback(async (fieldId: string, displayType: string) => {
    await updateField({
      id: fieldId as Id<"dbFields">,
      options: { displayType } as any,
    });
  }, [updateField]);

  // Type-Specific: Date Format
  const onDateFormat = useCallback(async (fieldId: string, format: string) => {
    await updateField({
      id: fieldId as Id<"dbFields">,
      options: { dateFormat: format } as any,
    });
  }, [updateField]);

  // Type-Specific: Time Format
  const onTimeFormat = useCallback(async (fieldId: string, format: string) => {
    await updateField({
      id: fieldId as Id<"dbFields">,
      options: { timeFormat: format } as any,
    });
  }, [updateField]);

  // Type-Specific: Edit Options (Select/MultiSelect)
  const onEditOptions = useCallback(async (
    fieldId: string,
    updatedOptions: Array<{ id: string; name: string; color: string }>
  ) => {
    await updateField({
      id: fieldId as Id<"dbFields">,
      options: { 
        selectOptions: updatedOptions.map(opt => ({
          id: opt.id,
          name: opt.name,
          color: opt.color,
        }))
      } as any,
    });
  }, [updateField]);

  // Type-Specific: Manage Colors (Select/MultiSelect)
  const onManageColors = useCallback((fieldId: string) => {
    // TODO: Open color manager modal
  }, []);

  // Type-Specific: Notifications (Date)
  const onNotifications = useCallback((fieldId: string) => {
    // TODO: Open notifications settings
  }, []);

  // Type-Specific: Show Page Icon (Title)
  const onShowPageIcon = useCallback((fieldId: string) => {
    // TODO: Toggle page icon visibility
  }, []);

  // Column Section: Insert Left
  const onInsertLeft = useCallback(async (fieldId: string) => {
    const field = fields.find(f => String(f._id) === fieldId);
    if (!field) throw new Error('Field not found');

    const currentIndex = fields.findIndex(f => String(f._id) === fieldId);
    const newPosition = currentIndex === 0 
      ? (field.position ?? 0) - 1  // Before first
      : ((fields[currentIndex - 1]?.position ?? 0) + (field.position ?? 0)) / 2; // Between

    await createField({
      tableId,
      name: 'New Property',
      type: 'text',
      isRequired: false,
    });

    // TODO: Reorder to insert at specific position
  }, [fields, tableId, createField]);

  // Column Section: Insert Right
  const onInsertRight = useCallback(async (fieldId: string) => {
    const field = fields.find(f => String(f._id) === fieldId);
    if (!field) throw new Error('Field not found');

    const currentIndex = fields.findIndex(f => String(f._id) === fieldId);
    const isLast = currentIndex === fields.length - 1;
    const newPosition = isLast
      ? (field.position ?? 0) + 1  // After last
      : ((field.position ?? 0) + (fields[currentIndex + 1]?.position ?? 0)) / 2; // Between

    await createField({
      tableId,
      name: 'New Property',
      type: 'text',
      isRequired: false,
    });

    // TODO: Reorder to insert at specific position
  }, [fields, tableId, createField]);

  // Column Section: Move Left
  const onMoveLeft = useCallback(async (fieldId: string) => {
    const currentIndex = fields.findIndex(f => String(f._id) === fieldId);
    if (currentIndex <= 0) {
      throw new Error('Already at the leftmost position');
    }

    // Swap positions with previous field
    const prevPosition = fields[currentIndex - 1]?.position ?? currentIndex - 1;
    await reorderField({
      fieldId: fieldId as Id<"dbFields">,
      newPosition: prevPosition - 0.5,
    });
  }, [fields, reorderField]);

  // Column Section: Move Right
  const onMoveRight = useCallback(async (fieldId: string) => {
    const currentIndex = fields.findIndex(f => String(f._id) === fieldId);
    if (currentIndex >= fields.length - 1) {
      throw new Error('Already at the rightmost position');
    }

    // Swap positions with next field
    const nextPosition = fields[currentIndex + 1]?.position ?? currentIndex + 1;
    await reorderField({
      fieldId: fieldId as Id<"dbFields">,
      newPosition: nextPosition + 0.5,
    });
  }, [fields, reorderField]);

  // Settings Section: Toggle Required
  const onToggleRequired = useCallback(async (fieldId: string, required: boolean) => {
    await updateField({
      id: fieldId as Id<"dbFields">,
      isRequired: required,
    });
  }, [updateField]);

  // Settings Section: Hide Property
  const onHide = useCallback(async (fieldId: string) => {
    if (!activeView) {
      console.warn('No active view to hide field from');
      return;
    }

    const visibleFields = activeView.settings.visibleFields || [];
    const nextVisible = visibleFields.filter(id => String(id) !== fieldId);

    await updateView({
      id: activeView._id,
      settings: {
        ...activeView.settings,
        visibleFields: nextVisible,
      },
    });
  }, [activeView, updateView]);

  // Danger Section: Delete Property
  const onDelete = useCallback(async (fieldId: string) => {
    await deleteField({
      id: fieldId as Id<"dbFields">,
    });
  }, [deleteField]);

  return {
    onRename,
    onDuplicate,
    onChangeType,
    onSort,
    onFilter,
    onCalculate,
    onWrap,
    onSetFormat,
    onShowAs,
    onDateFormat,
    onTimeFormat,
    onEditOptions,
    onManageColors,
    onNotifications,
    onShowPageIcon,
    onInsertLeft,
    onInsertRight,
    onMoveLeft,
    onMoveRight,
    onToggleRequired,
    onHide,
    onDelete,
  };
}
