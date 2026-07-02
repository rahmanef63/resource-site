/**
 * Options Manager Component
 * 
 * Reusable component for managing Select/Multi-Select options with inline CRUD operations.
 * Uses Command component pattern matching SelectEditor and MultiSelectEditor for consistency.
 * 
 * @example
 * ```tsx
 * <OptionsManager
 *   options={field.options.choices}
 *   onUpdateOptions={async (updated) => {
 *     await updateField({ id: fieldId, selectOptions: updated });
 *   }}
 *   propertyName="Department"
 *   open={isOpen}
 *   onOpenChange={setIsOpen}
 * />
 * ```
 */

"use client";

import React, { useState } from 'react';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandList,
} from "@/components/ui/command";
import { ResponsiveDialog } from "@/frontend/shared/ui";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  GripVertical, 
  MoreHorizontal, 
  Pencil, 
  Trash2, 
  Plus
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { COLOR_PALETTE_WITH_NAMES, getRandomColor } from '@/frontend/slices/database/properties/shared/constants';

export interface SelectChoice {
  id?: string;
  name: string;
  color?: string;
  icon?: string;
}

export interface OptionsManagerProps {
  /** Current options array */
  options: SelectChoice[];
  /** Callback when options are updated - should persist to database */
  onUpdateOptions: (updatedOptions: SelectChoice[]) => Promise<void> | void;
  /** Property name for display in dialog title */
  propertyName?: string;
  /** Controlled open state */
  open?: boolean;
  /** Controlled open state change handler */
  onOpenChange?: (open: boolean) => void;
  /** Optional trigger element (if not provided, uses controlled state only) */
  trigger?: React.ReactNode;
  /** Allow creating new options via comma-separated input */
  allowBulkCreate?: boolean;
}

/**
 * OptionsManager - Reusable options management component
 */
export function OptionsManager({ 
  options, 
  onUpdateOptions, 
  propertyName = 'Property',
  open = false,
  onOpenChange,
  trigger,
  allowBulkCreate = true,
}: OptionsManagerProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [bulkCreateInput, setBulkCreateInput] = useState('');

  // Handle bulk create (comma-separated)
  const handleBulkCreate = async () => {
    if (!bulkCreateInput.trim()) return;
    
    // Split by comma and create multiple options
    const names = bulkCreateInput
      .split(',')
      .map(n => n.trim())
      .filter(n => n.length > 0)
      .filter(n => !options.some(opt => opt.name.toLowerCase() === n.toLowerCase())); // Prevent duplicates
    
    if (names.length === 0) {
      setBulkCreateInput('');
      return;
    }

    const newOptions = names.map(name => ({
      id: `option-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name,
      color: getRandomColor(),
    }));

    try {
      await onUpdateOptions([...options, ...newOptions]);
      setBulkCreateInput('');
    } catch (error) {
      console.error('Failed to create options:', error);
    }
  };

  // Handle single option add
  const handleAddOption = async () => {
    const newOption: SelectChoice = {
      id: `option-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: 'New option',
      color: getRandomColor(),
    };

    try {
      await onUpdateOptions([...options, newOption]);
      // Start editing the new option
      setEditingId(newOption.id!);
      setEditingName(newOption.name);
    } catch (error) {
      console.error('Failed to add option:', error);
    }
  };

  // Handle edit start
  const handleEditStart = (option: SelectChoice) => {
    setEditingId(option.id || option.name);
    setEditingName(option.name);
  };

  // Handle edit save
  const handleSaveEdit = async () => {
    if (!editingId || !editingName.trim()) {
      setEditingId(null);
      return;
    }

    const updated = options.map(opt =>
      (opt.id || opt.name) === editingId
        ? { ...opt, name: editingName.trim() }
        : opt
    );

    try {
      await onUpdateOptions(updated);
      setEditingId(null);
      setEditingName('');
    } catch (error) {
      console.error('Failed to update option:', error);
    }
  };

  // Handle delete
  const handleDelete = async (option: SelectChoice) => {
    const updated = options.filter(opt => (opt.id || opt.name) !== (option.id || option.name));
    
    try {
      await onUpdateOptions(updated);
    } catch (error) {
      console.error('Failed to delete option:', error);
    }
  };

  // Handle color change
  const handleChangeColor = async (option: SelectChoice, newColor: string) => {
    const updated = options.map(opt =>
      (opt.id || opt.name) === (option.id || option.name)
        ? { ...opt, color: newColor }
        : opt
    );

    try {
      await onUpdateOptions(updated);
    } catch (error) {
      console.error('Failed to change color:', error);
    }
  };

  return (
    <ResponsiveDialog open={open ?? false} onOpenChange={onOpenChange ?? (() => {})} variant="modal" size="md">
      <ResponsiveDialog.Header className="px-4 py-3 flex items-center justify-between flex-row gap-2">
        <div>
          <ResponsiveDialog.Title className="text-sm font-semibold">Edit property</ResponsiveDialog.Title>
          <ResponsiveDialog.Description className="text-xs mt-0.5">
            {propertyName}
          </ResponsiveDialog.Description>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleAddOption}
          className="h-8 gap-1.5 text-xs"
        >
          <Plus className="h-3.5 w-3.5" />
          Add option
        </Button>
      </ResponsiveDialog.Header>
      <ResponsiveDialog.Body className="overflow-hidden">
        <Command>

          {/* Bulk create input */}
          {allowBulkCreate && (
            <div className="px-3 py-3 border-b bg-muted/30">
              <CommandInput
                placeholder="Create multiple options (comma-separated)..."
                value={bulkCreateInput}
                onValueChange={setBulkCreateInput}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleBulkCreate();
                  }
                }}
                className="h-9"
              />
              <p className="text-xs text-muted-foreground mt-2 px-1">
                Tip: Use commas to create multiple options at once
              </p>
            </div>
          )}

          {/* Options list */}
          <CommandList className="max-h-[400px]">
            <CommandEmpty>
              <div className="py-6 text-center text-sm text-muted-foreground">
                No options yet
              </div>
            </CommandEmpty>

            <CommandGroup>
              {options.map((option) => {
                const optionId = option.id || option.name;
                const isEditing = editingId === optionId;

                return (
                  <div
                    key={optionId}
                    className="group flex items-center gap-2 py-2 px-3 rounded-md hover:bg-muted/50 transition-colors"
                  >
                    {/* Drag handle */}
                    <GripVertical className="h-4 w-4 text-muted-foreground/50 flex-shrink-0" />

                    {/* Option content */}
                    <div className="flex-1 min-w-0">
                      {isEditing ? (
                        <Input
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleSaveEdit();
                            } else if (e.key === 'Escape') {
                              setEditingId(null);
                              setEditingName('');
                            }
                          }}
                          onBlur={() => handleSaveEdit()}
                          autoFocus
                          className="h-7 px-2 py-1 text-sm"
                        />
                      ) : (
                        <button
                          onClick={() => handleEditStart(option)}
                          className="w-full text-left"
                        >
                          <Badge
                            variant="secondary"
                            className="font-normal"
                            style={
                              option.color
                                ? {
                                    backgroundColor: option.color + '20',
                                    borderColor: option.color,
                                    color: option.color,
                                  }
                                : undefined
                            }
                          >
                            {option.name}
                          </Badge>
                        </button>
                      )}
                    </div>

                    {/* Actions menu */}
                    {!isEditing && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button aria-label="More options"
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem
                            onClick={() => handleEditStart(option)}
                          >
                            <Pencil className="h-4 w-4 mr-2" />
                            Rename
                          </DropdownMenuItem>
                          
                          <DropdownMenuSeparator />
                          
                          {/* Color grid */}
                          <div className="px-2 py-1.5">
                            <p className="text-xs font-medium text-muted-foreground mb-2">
                              Change color
                            </p>
                            <div className="grid grid-cols-4 gap-2">
                              {COLOR_PALETTE_WITH_NAMES.map((color) => (
                                <button
                                  key={color.value}
                                  onClick={() => handleChangeColor(option, color.value)}
                                  className={cn(
                                    'h-6 w-6 rounded border-2 transition-all hover:scale-110',
                                    option.color === color.value
                                      ? 'border-foreground ring-2 ring-offset-2 ring-foreground'
                                      : 'border-transparent'
                                  )}
                                  style={{ backgroundColor: color.value }}
                                  title={color.name}
                                />
                              ))}
                            </div>
                          </div>
                          
                          <DropdownMenuSeparator />
                          
                          <DropdownMenuItem
                            onClick={() => handleDelete(option)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </ResponsiveDialog.Body>
    </ResponsiveDialog>
  );
}
