/**
 * Edit Options Dialog for Select/Multi-Select Properties
 * 
 * Notion-style options editor with:
 * - Create new options
 * - Edit existing options (rename, change color, delete)
 * - Drag to reorder
 * - Color picker
 * - Search/filter
 */

"use client";

import React, { useState, useMemo } from 'react';
import { ResponsiveDialog } from '@/frontend/shared/ui';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { GripVertical, MoreHorizontal, Trash2, Check, Plus, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export interface SelectOption {
  id?: string;
  name: string;
  color?: string;
}

export interface EditOptionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  options: SelectOption[];
  onSave: (options: SelectOption[]) => void;
  title?: string;
  description?: string;
}

/**
 * Available colors for select options
 */
const OPTION_COLORS = [
  { id: 'default', label: 'Default', value: 'gray' },
  { id: 'gray', label: 'Gray', value: 'gray' },
  { id: 'brown', label: 'Brown', value: 'brown' },
  { id: 'orange', label: 'Orange', value: 'orange' },
  { id: 'yellow', label: 'Yellow', value: 'yellow' },
  { id: 'green', label: 'Green', value: 'green' },
  { id: 'blue', label: 'Blue', value: 'blue' },
  { id: 'purple', label: 'Purple', value: 'purple' },
  { id: 'pink', label: 'Pink', value: 'pink' },
  { id: 'red', label: 'Red', value: 'red' },
] as const;

/**
 * Get color classes for option badge
 */
function getColorClasses(color?: string) {
  const colorMap: Record<string, string> = {
    gray: 'bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200',
    brown: 'bg-amber-100 text-amber-800 hover:bg-amber-200 dark:bg-amber-900 dark:text-amber-200',
    orange: 'bg-orange-100 text-orange-800 hover:bg-orange-200 dark:bg-orange-900 dark:text-orange-200',
    yellow: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200 dark:bg-yellow-900 dark:text-yellow-200',
    green: 'bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900 dark:text-green-200',
    blue: 'bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-200',
    purple: 'bg-purple-100 text-purple-800 hover:bg-purple-200 dark:bg-purple-900 dark:text-purple-200',
    pink: 'bg-pink-100 text-pink-800 hover:bg-pink-200 dark:bg-pink-900 dark:text-pink-200',
    red: 'bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900 dark:text-red-200',
    default: 'bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200',
  };
  return colorMap[color || 'default'] || colorMap.default;
}

/**
 * Get color swatch classes for color picker
 */
function getColorSwatchClasses(color?: string) {
  const colorMap: Record<string, string> = {
    gray: 'bg-gray-500',
    brown: 'bg-amber-600',
    orange: 'bg-orange-500',
    yellow: 'bg-yellow-500',
    green: 'bg-green-500',
    blue: 'bg-blue-500',
    purple: 'bg-purple-500',
    pink: 'bg-pink-500',
    red: 'bg-red-500',
    default: 'bg-gray-400',
  };
  return colorMap[color || 'default'] || colorMap.default;
}

/**
 * Sortable Option Item
 */
interface SortableOptionItemProps {
  option: SelectOption;
  onEdit: (id: string, name: string) => void;
  onChangeColor: (id: string, color: string) => void;
  onDelete: (id: string) => void;
  isEditing: boolean;
  editValue: string;
  onEditStart: (id: string, name: string) => void;
  onEditChange: (value: string) => void;
  onEditSave: () => void;
  onEditCancel: () => void;
}

function SortableOptionItem({
  option,
  onEdit,
  onChangeColor,
  onDelete,
  isEditing,
  editValue,
  onEditStart,
  onEditChange,
  onEditSave,
  onEditCancel,
}: SortableOptionItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: option.id || 'default' });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'group flex items-center gap-2 p-2 rounded-md hover:bg-muted/50',
        isDragging && 'bg-muted'
      )}
    >
      {/* Drag Handle */}
      <button
        type="button"
        aria-label="Drag to reorder"
        className="cursor-grab active:cursor-grabbing text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4" />
      </button>

      {/* Option Badge or Input */}
      {isEditing ? (
        <Input
          value={editValue}
          onChange={(e) => onEditChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              onEditSave();
            } else if (e.key === 'Escape') {
              onEditCancel();
            }
          }}
          onBlur={onEditSave}
          autoFocus
          className="flex-1 h-8"
        />
      ) : (
        <button
          type="button"
          onClick={() => option.id && onEditStart(option.id, option.name)}
          className={cn(
            'flex-1 text-left px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
            getColorClasses(option.color)
          )}
        >
          {option.name}
        </button>
      )}

      {/* Color Picker */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <div className={cn('h-4 w-4 rounded', getColorSwatchClasses(option.color))} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <div className="p-2">
            <Label className="text-xs text-muted-foreground mb-2 block">Colors</Label>
            <div className="grid grid-cols-5 gap-2">
              {OPTION_COLORS.map((colorOption) => (
                <button
                  key={colorOption.id}
                  type="button"
                  onClick={() => option.id && onChangeColor(option.id, colorOption.value)}
                  className={cn(
                    'h-6 w-6 rounded flex items-center justify-center transition-all hover:scale-110',
                    getColorSwatchClasses(colorOption.value)
                  )}
                  title={colorOption.label}
                >
                  {option.color === colorOption.value && (
                    <Check className="h-3 w-3 text-white" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Delete Button */}
      <Button aria-label="Delete"
        variant="ghost"
        size="sm"
        onClick={() => option.id && onDelete(option.id)}
        className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}

/**
 * Edit Options Dialog Component
 */
export function EditOptionsDialog({
  open,
  onOpenChange,
  options: initialOptions,
  onSave,
  title = 'Edit Options',
  description = 'Create, edit, and organize options for this property',
}: EditOptionsDialogProps) {
  const [options, setOptions] = useState<SelectOption[]>(initialOptions);
  const [searchQuery, setSearchQuery] = useState('');
  const [newOptionName, setNewOptionName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  // Reset state and normalize options when dialog opens
  React.useEffect(() => {
    if (open) {
      const normalizedOptions = initialOptions.map((opt) => ({
        ...opt,
        id: opt.id || `option-${Date.now()}-${Math.random()}`,
        color: opt.color || 'gray',
      }));
      setOptions(normalizedOptions as SelectOption[]);
      setSearchQuery('');
      setNewOptionName('');
      setEditingId(null);
      setEditValue('');
    }
  }, [open, initialOptions]);

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const filteredOptions = useMemo(() => {
    if (!searchQuery) return options;
    const query = searchQuery.toLowerCase();
    return options.filter((option) =>
      option.name.toLowerCase().includes(query)
    );
  }, [options, searchQuery]);

  // Handle drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setOptions((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  // Add new option
  const handleAddOption = () => {
    if (!newOptionName.trim()) return;

    const newOption: SelectOption = {
      id: `option-${Date.now()}`,
      name: newOptionName.trim(),
      color: 'gray',
    };

    setOptions([...options, newOption]);
    setNewOptionName('');
  };

  // Edit option name
  const handleEditStart = (id: string, name: string) => {
    setEditingId(id);
    setEditValue(name);
  };

  const handleEditSave = () => {
    if (!editingId || !editValue.trim()) {
      setEditingId(null);
      return;
    }

    setOptions(
      options.map((opt) =>
        opt.id === editingId ? { ...opt, name: editValue.trim() } : opt
      )
    );
    setEditingId(null);
    setEditValue('');
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditValue('');
  };

  // Change option color
  const handleChangeColor = (id: string, color: string) => {
    setOptions(
      options.map((opt) => (opt.id === id ? { ...opt, color } : opt))
    );
  };

  // Delete option
  const handleDelete = (id: string) => {
    setOptions(options.filter((opt) => opt.id !== id));
  };

  // Save and close
  const handleSave = () => {
    onSave(options);
    onOpenChange(false);
  };

  return (
    <ResponsiveDialog open={open} onOpenChange={onOpenChange} variant="modal" size="lg">
      <ResponsiveDialog.Header>
        <ResponsiveDialog.Title>{title}</ResponsiveDialog.Title>
        <ResponsiveDialog.Description>{description}</ResponsiveDialog.Description>
      </ResponsiveDialog.Header>

      <ResponsiveDialog.Body className="flex flex-col gap-4 overflow-hidden px-4 py-4 sm:px-6">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search for an option..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Add New Option */}
          <div className="flex gap-2">
            <Input
              placeholder="Select an option or create one"
              value={newOptionName}
              onChange={(e) => setNewOptionName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleAddOption();
                }
              }}
              className="flex-1"
            />
            <Button
              onClick={handleAddOption}
              disabled={!newOptionName.trim()}
              size="sm"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add
            </Button>
          </div>

          {/* Options List */}
          <ScrollArea className="flex-1 pr-4">
            <div className="space-y-1">
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={filteredOptions.map((opt) => opt.id || 'default')}
                  strategy={verticalListSortingStrategy}
                >
                  {filteredOptions.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground text-sm">
                      {searchQuery
                        ? 'No options found'
                        : 'No options yet. Create your first option above.'}
                    </div>
                  ) : (
                    filteredOptions.map((option) => (
                      <SortableOptionItem
                        key={option.id}
                        option={option}
                        onEdit={handleEditStart}
                        onChangeColor={handleChangeColor}
                        onDelete={handleDelete}
                        isEditing={editingId === option.id}
                        editValue={editValue}
                        onEditStart={handleEditStart}
                        onEditChange={setEditValue}
                        onEditSave={handleEditSave}
                        onEditCancel={handleEditCancel}
                      />
                    ))
                  )}
                </SortableContext>
              </DndContext>
            </div>
          </ScrollArea>

          {/* Stats */}
          <div className="text-xs text-muted-foreground">
            {options.length} option{options.length !== 1 ? 's' : ''}
            {searchQuery && filteredOptions.length !== options.length && (
              <span> · {filteredOptions.length} shown</span>
            )}
          </div>
      </ResponsiveDialog.Body>

      <ResponsiveDialog.Footer className="flex-col-reverse sm:flex-row">
        <Button variant="outline" onClick={() => onOpenChange(false)}>
          Cancel
        </Button>
        <Button onClick={handleSave}>
          Save Changes
        </Button>
      </ResponsiveDialog.Footer>
    </ResponsiveDialog>
  );
}
