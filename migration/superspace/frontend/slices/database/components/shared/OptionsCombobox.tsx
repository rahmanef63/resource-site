/**
 * Options Combobox - Simple UI for Managing Options
 * 
 * Features:
 * - View all existing options with colored badges
 * - Create multiple options at once using comma separator
 * - Quick inline edit, delete, and color change
 * - Minimal nested menus
 */

"use client";

import React, { useState, useEffect } from 'react';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  Plus,
  Check,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SelectOption {
  id?: string;
  name: string;
  color?: string;
  icon?: string;
}

export interface OptionsComboboxProps {
  options: SelectOption[];
  onUpdateOptions: (updatedOptions: SelectOption[]) => Promise<void> | void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
}

// Color palette
const COLORS = [
  '#6b7280', '#f59e0b', '#eab308', '#22c55e', 
  '#3b82f6', '#8b5cf6', '#ec4899', '#ef4444'
];

const getRandomColor = () => COLORS[Math.floor(Math.random() * COLORS.length)];

export function OptionsCombobox({
  options,
  onUpdateOptions,
  open,
  onOpenChange,
  trigger,
}: OptionsComboboxProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  // Reset search when closed
  useEffect(() => {
    if (!open) {
      setSearchQuery('');
      setEditingId(null);
    }
  }, [open]);

  // Handle create multiple options (comma-separated)
  const handleCreateOptions = async () => {
    if (!searchQuery.trim()) return;

    // Split by comma and clean up
    const names = searchQuery
      .split(',')
      .map(n => n.trim())
      .filter(n => n.length > 0)
      .filter(n => !options.some(opt => opt.name.toLowerCase() === n.toLowerCase()));

    if (names.length === 0) return;

    // Create new options with random colors
    const newOptions: SelectOption[] = names.map(name => ({
      id: `option-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name,
      color: getRandomColor(),
    }));

    await onUpdateOptions([...options, ...newOptions]);
    setSearchQuery('');
  };

  // Handle edit option name
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

    await onUpdateOptions(updated);
    setEditingId(null);
    setEditingName('');
  };

  // Handle delete option
  const handleDelete = async (option: SelectOption) => {
    const updated = options.filter(opt => (opt.id || opt.name) !== (option.id || option.name));
    await onUpdateOptions(updated);
  };

  // Handle change color
  const handleChangeColor = async (option: SelectOption, color: string) => {
    const updated = options.map(opt =>
      (opt.id || opt.name) === (option.id || option.name)
        ? { ...opt, color }
        : opt
    );
    await onUpdateOptions(updated);
  };

  // Filter options based on search
  const filteredOptions = options.filter(opt =>
    opt.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Check if can create new
  const canCreateNew = searchQuery.trim().length > 0 && 
    !options.some(opt => opt.name.toLowerCase() === searchQuery.toLowerCase());

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      {trigger && <PopoverTrigger asChild>{trigger}</PopoverTrigger>}
      <PopoverContent className="w-[400px] p-0" align="start">
        <Command>
          <CommandInput
            placeholder="Search or create options (comma-separated)..."
            value={searchQuery}
            onValueChange={setSearchQuery}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleCreateOptions();
              }
            }}
          />
          <CommandList>
            <CommandEmpty>
              <div className="p-4 text-center text-sm">
                {canCreateNew ? (
                  <div className="space-y-2">
                    <p className="text-muted-foreground">
                      Press <kbd className="px-1.5 py-0.5 text-xs border rounded">Enter</kbd> to create
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Tip: Use commas to create multiple options
                    </p>
                  </div>
                ) : (
                  <p className="text-muted-foreground">No options found</p>
                )}
              </div>
            </CommandEmpty>

            {filteredOptions.length > 0 && (
              <CommandGroup>
                {filteredOptions.map((option) => (
                  <div key={option.id || option.name} className="group relative">
                    {editingId === (option.id || option.name) ? (
                      // Editing mode
                      <div className="flex items-center gap-2 px-2 py-1.5">
                        <GripVertical className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <Input
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleSaveEdit();
                            } else if (e.key === 'Escape') {
                              setEditingId(null);
                              setEditingName('');
                            }
                          }}
                          onBlur={handleSaveEdit}
                          autoFocus
                          className="h-7 flex-1"
                        />
                      </div>
                    ) : (
                      // Display mode
                      <CommandItem
                        value={option.name}
                        className="flex items-center gap-2"
                        onSelect={() => {}}
                      >
                        <GripVertical className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 flex-shrink-0" />
                        <Badge
                          variant="secondary"
                          className="truncate flex-1"
                          style={option.color ? {
                            backgroundColor: option.color + '20',
                            borderColor: option.color,
                            color: option.color
                          } : undefined}
                        >
                          {option.name}
                        </Badge>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button aria-label="More options"
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 flex-shrink-0"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                            <DropdownMenuItem onClick={() => {
                              setEditingId(option.id || option.name);
                              setEditingName(option.name);
                            }}>
                              <Pencil className="mr-2 h-4 w-4" />
                              Rename
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <div className="px-2 py-1.5">
                              <div className="text-xs text-muted-foreground mb-2">Colors</div>
                              <div className="grid grid-cols-4 gap-1">
                                {COLORS.map((color) => (
                                  <button
                                    key={color}
                                    onClick={() => handleChangeColor(option, color)}
                                    className={cn(
                                      'h-6 w-6 rounded border-2 hover:scale-110 transition-transform',
                                      option.color === color ? 'border-foreground' : 'border-transparent'
                                    )}
                                    style={{ backgroundColor: color }}
                                  />
                                ))}
                              </div>
                            </div>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDelete(option)}
                              className="text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </CommandItem>
                    )}
                  </div>
                ))}
              </CommandGroup>
            )}

            {/* Create button hint */}
            {canCreateNew && (
              <div className="px-2 py-1.5 border-t">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start"
                  onClick={handleCreateOptions}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create &quot;{searchQuery.length > 30 ? searchQuery.substring(0, 30) + '...' : searchQuery}&quot;
                </Button>
              </div>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
