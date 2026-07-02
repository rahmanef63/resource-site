"use client";

import React, { useState } from 'react';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
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
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { GripVertical, MoreHorizontal, Plus, Palette, Pencil, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

// Color palette matching SelectEditor
const COLOR_PALETTE = [
  { name: 'Gray', value: '#6b7280' },
  { name: 'Orange', value: '#f59e0b' },
  { name: 'Yellow', value: '#eab308' },
  { name: 'Green', value: '#22c55e' },
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Purple', value: '#8b5cf6' },
  { name: 'Pink', value: '#ec4899' },
  { name: 'Red', value: '#ef4444' },
];

interface SelectOption {
  id?: string;
  name: string;
  color?: string;
}

interface OptionsPopoverProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  options: SelectOption[];
  onUpdateOptions: (options: SelectOption[]) => void;
  propertyName?: string;
  trigger?: React.ReactNode;
}

/**
 * OptionsSheet - Popover for editing select/multi-select options
 * Uses Command component for search and filtering
 * Supports bulk creation with comma-separated values
 */
export function OptionsSheet({
  open,
  onOpenChange,
  options,
  onUpdateOptions,
  propertyName = 'Property',
  trigger,
}: OptionsPopoverProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  // Helper to get random color
  const getRandomColor = () => {
    return COLOR_PALETTE[Math.floor(Math.random() * COLOR_PALETTE.length)].value;
  };

  // Handle add new option
  const handleAddOption = () => {
    const newOption: SelectOption = {
      id: `option-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: 'New option',
      color: getRandomColor(),
    };
    onUpdateOptions([...options, newOption]);
    // Start editing the new option
    setEditingId(newOption.id!);
    setEditingName(newOption.name);
  };

  // Handle rename
  const handleStartEdit = (option: SelectOption) => {
    setEditingId(option.id || option.name);
    setEditingName(option.name);
  };

  const handleSaveEdit = (optionId: string) => {
    if (!editingName.trim()) {
      setEditingId(null);
      return;
    }

    const updated = options.map((opt) =>
      (opt.id || opt.name) === optionId
        ? { ...opt, name: editingName.trim() }
        : opt
    );
    onUpdateOptions(updated);
    setEditingId(null);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingName('');
  };

  // Handle delete
  const handleDelete = (optionId: string) => {
    const filtered = options.filter((opt) => (opt.id || opt.name) !== optionId);
    onUpdateOptions(filtered);
  };

  // Handle color change
  const handleChangeColor = (optionId: string, color: string) => {
    const updated = options.map((opt) =>
      (opt.id || opt.name) === optionId
        ? { ...opt, color }
        : opt
    );
    onUpdateOptions(updated);
  };

  return (
    <ResponsiveDialog open={open} onOpenChange={onOpenChange} variant="modal" size="md">
      <ResponsiveDialog.Header className="sr-only">
        <ResponsiveDialog.Title>Edit {propertyName} options</ResponsiveDialog.Title>
        <ResponsiveDialog.Description>Rename, recolor, or delete options</ResponsiveDialog.Description>
      </ResponsiveDialog.Header>
      <ResponsiveDialog.Body className="overflow-hidden p-0">
        <Command>
          {/* Header */}
          <div className="border-b px-4 py-3 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold">Edit property</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {propertyName}
              </p>
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
          </div>

          {/* Bulk create input */}
          <div className="px-3 py-3 border-b bg-muted/30">
            <CommandInput
              placeholder="Create multiple options (comma-separated)..."
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const input = e.currentTarget.value.trim();
                  if (!input) return;
                  
                  // Split by comma and create multiple options
                  const names = input
                    .split(',')
                    .map(n => n.trim())
                    .filter(n => n.length > 0);
                  
                  if (names.length > 0) {
                    const newOptions = names.map(name => ({
                      id: `option-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                      name,
                      color: getRandomColor(),
                    }));
                    
                    onUpdateOptions([...options, ...newOptions]);
                    e.currentTarget.value = '';
                  }
                }
              }}
              className="h-9"
            />
            <p className="text-xs text-muted-foreground mt-2 px-1">
              Tip: Use commas to create multiple options at once
            </p>
          </div>

          {/* Options list */}
          <CommandList className="max-h-[400px]">
            {/* <CommandEmpty>
              <div className="py-6 text-center text-sm text-muted-foreground">
                No options yet
              </div>
            </CommandEmpty> */}
            
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
                                  handleSaveEdit(optionId);
                                } else if (e.key === 'Escape') {
                                  handleCancelEdit();
                                }
                              }}
                              onBlur={() => handleSaveEdit(optionId)}
                              autoFocus
                              className="h-7 px-2 py-1 text-sm"
                            />
                          ) : (
                            <button
                              onClick={() => handleStartEdit(option)}
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
                                onClick={() => handleStartEdit(option)}
                              >
                                <Pencil className="h-4 w-4 mr-2" />
                                Rename
                              </DropdownMenuItem>
                              
                              <DropdownMenuSeparator />
                              
                              {/* Color submenu */}
                              <div className="px-2 py-1.5">
                                <p className="text-xs font-medium text-muted-foreground mb-2">
                                  Change color
                                </p>
                                <div className="grid grid-cols-4 gap-2">
                                  {COLOR_PALETTE.map((color) => (
                                    <button
                                      key={color.value}
                                      onClick={() => handleChangeColor(optionId, color.value)}
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
                                onClick={() => handleDelete(optionId)}
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
