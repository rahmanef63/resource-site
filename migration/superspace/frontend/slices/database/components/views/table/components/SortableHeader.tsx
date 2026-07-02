"use client";

import React, { useCallback, useRef, useState } from "react";
import { GripVertical } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Column } from "@tanstack/react-table";
import type { DatabaseFeature } from "../../../../types";
import { PropertyMenu } from "../../../PropertyMenu/PropertyMenu";
import type { PropertyMenuProps } from "../../../PropertyMenu/types";
import { cn } from "@/lib/utils";
import { DATABASE_FIELD_DEFINITIONS } from "../../../../config/fields";
import { getFieldId } from "../../../PropertyMenu/utils";

export interface SortableHeaderProps {
  column: Column<DatabaseFeature, unknown>;
  field: PropertyMenuProps['field'];
  isVisible?: boolean;
  isRequired?: boolean;
  disableDrag?: boolean;
  id: string;

  // PropertyMenu handlers - all optional, pass what you have
  onRename?: (fieldId: string, name: string) => Promise<void> | void;
  onDuplicate?: (fieldId: string) => Promise<void> | void;
  onChangeType?: (fieldId: string, newType: any) => Promise<void> | void;
  onSort?: (fieldId: string, direction: 'asc' | 'desc') => void;
  onFilter?: (fieldId: string) => void;
  onCalculate?: (fieldId: string, calcType: string) => void;
  onWrap?: (fieldId: string) => void;
  onSetFormat?: (fieldId: string, format: string) => Promise<void> | void;
  onShowAs?: (fieldId: string, displayType: string) => Promise<void> | void;
  onDateFormat?: (fieldId: string, format: string) => Promise<void> | void;
  onTimeFormat?: (fieldId: string, format: string) => Promise<void> | void;
  onEditOptions?: (fieldId: string, updatedOptions: Array<{ id: string; name: string; color: string }>) => Promise<void> | void;
  onManageColors?: (fieldId: string) => void;
  onNotifications?: (fieldId: string) => void;
  onShowPageIcon?: (fieldId: string) => void;
  onInsertLeft?: (fieldId: string) => Promise<void> | void;
  onInsertRight?: (fieldId: string) => Promise<void> | void;
  onMoveLeft?: (fieldId: string) => Promise<void> | void;
  onMoveRight?: (fieldId: string) => Promise<void> | void;
  onToggleRequired?: (fieldId: string, required: boolean) => Promise<void> | void;
  onHide?: (fieldId: string) => Promise<void> | void;
  onDelete?: (fieldId: string) => Promise<void> | void;
}

export function SortableHeader({
  id,
  column,
  field,
  isVisible,
  isRequired,
  disableDrag,
  // Pass all PropertyMenu handlers
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
}: SortableHeaderProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({
      id,
      disabled: disableDrag,
    });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  };

  // State for PropertyMenu
  const [menuOpen, setMenuOpen] = useState(false);
  const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup timeout on unmount
  React.useEffect(() => {
    return () => {
      if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current);
        clickTimeoutRef.current = null;
      }
    };
  }, []);

  // Get field icon
  const fieldDefinition = DATABASE_FIELD_DEFINITIONS[field.type as keyof typeof DATABASE_FIELD_DEFINITIONS];
  const FieldIcon = fieldDefinition?.icon;

  // Handle click behavior
  const handleHeaderClick = useCallback((e: React.MouseEvent) => {
    // Don't interfere with drag handle
    if ((e.target as HTMLElement).closest('[data-drag-handle]')) {
      return;
    }

    e.preventDefault();
    e.stopPropagation();

    // Clear any pending single-click timeout
    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current);
      clickTimeoutRef.current = null;
    }

    // Single click - open menu (with small delay to detect double-click)
    clickTimeoutRef.current = setTimeout(() => {
      setMenuOpen(true);
    }, 200);
  }, []);

  const handleHeaderDoubleClick = useCallback((e: React.MouseEvent) => {
    // Don't interfere with drag handle
    if ((e.target as HTMLElement).closest('[data-drag-handle]')) {
      return;
    }

    e.preventDefault();
    e.stopPropagation();

    // Clear single-click timeout
    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current);
      clickTimeoutRef.current = null;
    }

    // Double click - trigger rename directly
    if (onRename) {
      const fieldId = getFieldId(field);
      const newName = prompt('Rename property:', field.name);
      if (newName && newName !== field.name) {
        onRename(fieldId, newName);
      }
    }
  }, [field, onRename]);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group flex h-full w-full items-center gap-2 px-3 py-2 transition-colors hover:bg-muted/50",
        isDragging && "bg-muted ring-2 ring-primary/20",
      )}
    >
      {/* Drag Handle - only visible on hover, separate from click area */}
      <button
        type="button"
        data-drag-handle
        className={cn(
          "flex h-5 w-5 shrink-0 items-center justify-center opacity-0 transition-opacity group-hover:opacity-100",
          !disableDrag && "cursor-grab active:cursor-grabbing",
          isDragging && "opacity-100",
        )}
        {...listeners}
        {...attributes}
        aria-label={`Drag to reposition ${field.name}`}
        tabIndex={-1}
      >
        <GripVertical className="h-3.5 w-3.5 text-muted-foreground" />
      </button>

      {/* PropertyMenu wraps the clickable name area */}
      <PropertyMenu
        field={field}
        isVisible={isVisible}
        isRequired={isRequired}
        open={menuOpen}
        onOpenChange={setMenuOpen}
        onRename={onRename}
        onDuplicate={onDuplicate}
        onChangeType={onChangeType}
        onSort={onSort}
        onFilter={onFilter}
        onCalculate={onCalculate}
        onWrap={onWrap}
        onSetFormat={onSetFormat}
        onShowAs={onShowAs}
        onDateFormat={onDateFormat}
        onTimeFormat={onTimeFormat}
        onEditOptions={onEditOptions}
        onManageColors={onManageColors}
        onNotifications={onNotifications}
        onShowPageIcon={onShowPageIcon}
        onInsertLeft={onInsertLeft}
        onInsertRight={onInsertRight}
        onMoveLeft={onMoveLeft}
        onMoveRight={onMoveRight}
        onToggleRequired={onToggleRequired}
        onHide={onHide}
        onDelete={onDelete}
        align="start"
        side="bottom"
      >
        <button
          type="button"
          className="flex flex-1 items-center gap-2 min-w-0 cursor-pointer rounded px-2 py-1 -mx-2 -my-1 hover:bg-muted/30 bg-transparent border-0 text-left"
          onClick={handleHeaderClick}
          onDoubleClick={handleHeaderDoubleClick}
        >
          {/* Property Icon + Name */}
          {FieldIcon && (
            <FieldIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
          )}
          <span className="truncate text-xs font-medium text-foreground">
            {field.name}
          </span>
          {field.isRequired && (
            <span className="shrink-0 text-[10px] font-medium text-red-500">*</span>
          )}
        </button>
      </PropertyMenu>
    </div>
  );
}
