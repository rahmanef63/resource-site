/**
 * Option Actions Menu - Reusable Component
 * 
 * Provides consistent option management actions across:
 * - Cell dropdown editors (SelectEditor, MultiSelectEditor)
 * - Property menu submenu
 * 
 * Actions: Rename, Delete, Change Color
 */

"use client";

import React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
  DropdownMenuPortal,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Pencil, Trash2, Palette } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SelectOption {
  id?: string;
  name: string;
  color?: string;
  icon?: string;
}

export interface OptionActionsMenuProps {
  option: SelectOption;
  onRename: (optionId: string) => void;
  onDelete: (optionId: string) => void;
  onChangeColor: (optionId: string, color: string) => void;
  trigger?: React.ReactNode;
  align?: 'start' | 'center' | 'end';
  side?: 'top' | 'right' | 'bottom' | 'left';
}

// Color palette configuration
export const COLOR_PALETTE = [
  { id: 'gray', label: 'Gray', hex: '#6b7280' },
  { id: 'orange', label: 'Orange', hex: '#f59e0b' },
  { id: 'yellow', label: 'Yellow', hex: '#eab308' },
  { id: 'green', label: 'Green', hex: '#22c55e' },
  { id: 'blue', label: 'Blue', hex: '#3b82f6' },
  { id: 'purple', label: 'Purple', hex: '#8b5cf6' },
  { id: 'pink', label: 'Pink', hex: '#ec4899' },
  { id: 'red', label: 'Red', hex: '#ef4444' },
] as const;

export function OptionActionsMenu({
  option,
  onRename,
  onDelete,
  onChangeColor,
  trigger,
  align = 'end',
  side = 'bottom',
}: OptionActionsMenuProps) {
  const optionId = option.id || option.name;

  const defaultTrigger = (
    <Button aria-label="More options"
      variant="ghost"
      size="sm"
      className="h-6 w-6 p-0"
      onClick={(e) => e.stopPropagation()}
    >
      <MoreHorizontal className="h-4 w-4" />
    </Button>
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
        {trigger || defaultTrigger}
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align} side={side} onClick={(e) => e.stopPropagation()}>
        {/* Rename */}
        <DropdownMenuItem onClick={() => onRename(optionId)}>
          <Pencil className="mr-2 h-4 w-4" />
          Rename
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Change Color Submenu */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Palette className="mr-2 h-4 w-4" />
            Change Color
          </DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent>
              <div className="p-2">
                <div className="text-xs text-muted-foreground mb-2">Select color</div>
                <div className="grid grid-cols-4 gap-1">
                  {COLOR_PALETTE.map((color) => (
                    <button
                      key={color.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onChangeColor(optionId, color.hex);
                      }}
                      className={cn(
                        'h-6 w-6 rounded border-2 hover:scale-110 transition-transform',
                        option.color === color.hex ? 'border-foreground' : 'border-transparent'
                      )}
                      style={{ backgroundColor: color.hex }}
                      title={color.label}
                    />
                  ))}
                </div>
              </div>
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>

        <DropdownMenuSeparator />

        {/* Delete */}
        <DropdownMenuItem 
          onClick={() => onDelete(optionId)}
          className="text-destructive focus:text-destructive"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/**
 * Helper function to build menu items for property menu submenu
 * Creates consistent nested submenu structure
 */
export function buildOptionMenuItems(
  option: SelectOption,
  callbacks: {
    onRename: (optionId: string) => void;
    onDelete: (optionId: string) => void;
    onChangeColor: (optionId: string, color: string) => void;
  }
): Array<{
  id: string;
  label: string;
  icon?: any;
  color?: string;
  onClick?: () => void;
  submenu?: Array<any>;
}> {
  const optionId = option.id || option.name;

  return [
    {
      id: `rename-${optionId}`,
      label: 'Rename',
      icon: Pencil,
      onClick: () => callbacks.onRename(optionId),
    },
    {
      id: `delete-${optionId}`,
      label: 'Delete',
      icon: Trash2,
      onClick: () => callbacks.onDelete(optionId),
    },
    {
      id: `colors-${optionId}`,
      label: 'Change Color',
      icon: Palette,
      submenu: COLOR_PALETTE.map((color) => ({
        id: `color-${color.id}-${optionId}`,
        label: color.label,
        color: color.hex,
        onClick: () => callbacks.onChangeColor(optionId, color.hex),
      })),
    },
  ];
}

/**
 * Get color badge classes for consistent styling
 */
export function getColorBadgeClasses(color?: string): string {
  const colorMap: Record<string, string> = {
    '#6b7280': 'bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-800 dark:text-gray-200',
    '#f59e0b': 'bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-900 dark:text-orange-200',
    '#eab308': 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900 dark:text-yellow-200',
    '#22c55e': 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900 dark:text-green-200',
    '#3b82f6': 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900 dark:text-blue-200',
    '#8b5cf6': 'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-900 dark:text-purple-200',
    '#ec4899': 'bg-pink-100 text-pink-800 border-pink-300 dark:bg-pink-900 dark:text-pink-200',
    '#ef4444': 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900 dark:text-red-200',
  };
  return colorMap[color || '#6b7280'] || colorMap['#6b7280'];
}
