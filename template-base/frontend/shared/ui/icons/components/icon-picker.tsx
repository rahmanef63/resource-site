/**
 * Icon Picker Component - SINGLE SOURCE OF TRUTH
 *
 * Use this component throughout the app for icon selection.
 * Supports: icon selection, color options, and background color.
 *
 * @module frontend/shared/ui/icons/components/icon-picker
 */

"use client";

import * as React from "react";
import { Palette, Search, HelpCircle } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ResponsiveDialog } from "@/frontend/shared/ui/components/ResponsiveDialog";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

import { InlineColorPicker } from "@/frontend/shared/ui/color-picker";
import { ICON_COLOR_PRESETS, BACKGROUND_COLOR_PRESETS } from "@/frontend/shared/constants/colors";

import { DynamicIcon, getIconComponent } from "../dynamic-icon";
import { ICONS_BY_CATEGORY } from "../constants";
import type { IconName } from "../types";

// Extract just the hex values for the color picker
const ICON_COLORS = ICON_COLOR_PRESETS.filter(c => c.value.startsWith('#')).map(c => c.value);
const BACKGROUND_COLORS = BACKGROUND_COLOR_PRESETS.filter(c => c.value.startsWith('#')).map(c => c.value);

// Flatten all icons from categories
const ALL_ICONS = Object.values(ICONS_BY_CATEGORY).flat();

// Icon categories for filtering (simplified)
const ICON_CATEGORIES: Record<string, string[]> = {
  General: ["Home", "Star", "Heart", "Bookmark", "Flag", "Tag", "Settings", "HelpCircle"],
  Business: ["Building2", "Briefcase", "Store", "Landmark", "Factory", "Warehouse", "ShoppingCart", "Target"],
  Organization: ["Users", "FolderKanban", "LayoutDashboard", "Calendar", "MessageSquare"],
  Files: ["Folder", "FileText", "Archive", "Box", "Package", "Layers", "Download", "Image"],
  Development: ["Code", "Terminal", "GitBranch", "Database", "Server", "Cpu"],
  Communication: ["Mail", "Phone", "Video", "Bell", "MessageSquare"],
  Media: ["Music", "Film", "Camera", "Mic", "Image"],
  Tools: ["Settings", "Wrench", "Hammer", "Scissors", "Lightbulb"],
  Nature: ["Sun", "Moon", "Cloud", "Leaf", "Mountain"],
  Specials: ["Zap", "Rocket", "Trophy", "Crown", "Gem", "Sparkles"],
  Database: ["Database", "Table2", "LayoutGrid", "List", "LayoutList", "CheckSquare", "Kanban"],
};

// ============================================================================
// Types
// ============================================================================

export interface IconPickerProps {
  /** Currently selected icon name */
  icon?: IconName;
  /** Currently selected icon color */
  color?: string;
  /** Currently selected background color */
  backgroundColor?: string;
  /** Callback when icon is changed */
  onIconChange?: (iconName: IconName) => void;
  /** Callback when color is changed */
  onColorChange?: (color: string) => void;
  /** Callback when background color is changed */
  onBackgroundChange?: (color: string) => void;
  /** Callback when picker closes */
  onClose?: () => void;
  /** Whether to show color picker */
  showColor?: boolean;
  /** Whether to show background color picker */
  showBackground?: boolean;
  /** Custom trigger element */
  trigger?: React.ReactNode;
  /** Trigger class name */
  triggerClassName?: string;
  /** Content class name */
  contentClassName?: string;
  /** Custom class name for wrapper */
  className?: string;
  /** Disabled state */
  disabled?: boolean;
  /** Use dialog instead of popover */
  asDialog?: boolean;
  /** Dialog open state (controlled) */
  open?: boolean;
  /** Dialog open change callback */
  onOpenChange?: (open: boolean) => void;
}

// ============================================================================
// Helper Functions
// ============================================================================

export function getIconStyle(color?: string, backgroundColor?: string): React.CSSProperties {
  const style: React.CSSProperties = {};

  if (color) {
    if (["primary", "secondary", "accent", "destructive", "muted"].includes(color)) {
      style.color = `hsl(var(--${color}))`;
    } else {
      style.color = color;
    }
  }

  if (backgroundColor) {
    if (backgroundColor === "transparent") {
      style.background = "transparent";
    } else if (["primary", "secondary", "accent", "destructive", "muted"].includes(backgroundColor)) {
      style.backgroundColor = `hsl(var(--${backgroundColor}))`;
    } else {
      style.backgroundColor = backgroundColor;
    }
  }

  return style;
}

// ============================================================================
// Components
// ============================================================================

/**
 * Icon Picker - Popover or Dialog based
 */
export function IconPicker({
  icon = "Folder",
  color,
  backgroundColor,
  onIconChange,
  onColorChange,
  onBackgroundChange,
  onClose,
  showColor = false,
  showBackground = false,
  trigger,
  triggerClassName,
  contentClassName,
  className,
  disabled,
  asDialog = false,
  open: controlledOpen,
  onOpenChange,
}: IconPickerProps) {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [selectedCategory, setSelectedCategory] = React.useState<string>("all");

  const open = controlledOpen ?? internalOpen;
  const setOpen = (value: boolean) => {
    if (onOpenChange) {
      onOpenChange(value);
    } else {
      setInternalOpen(value);
    }
    if (!value && onClose) {
      onClose();
    }
  };

  const filteredIcons = React.useMemo(() => {
    let icons = ALL_ICONS;

    // Filter by category
    if (selectedCategory !== "all") {
      icons = ICON_CATEGORIES[selectedCategory] || icons;
    }

    // Filter by search
    if (search) {
      const lowerSearch = search.toLowerCase();
      icons = icons.filter((name) => name.toLowerCase().includes(lowerSearch));
    }

    return icons;
  }, [search, selectedCategory]);

  const handleIconSelect = (iconName: string) => {
    onIconChange?.(iconName);
  };

  const iconStyle = getIconStyle(color, backgroundColor);

  const content = (
    <div className="space-y-3">
      {/* Color options */}
      {(showColor || showBackground) && (
        <>
          <div className="flex items-center gap-4">
            {showColor && (
              <div className="flex items-center gap-1.5">
                <Palette className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Color</span>
                <InlineColorPicker
                  value={color}
                  onChange={onColorChange}
                  presets={ICON_COLORS}
                />
              </div>
            )}
            {showBackground && (
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-muted-foreground">Background</span>
                <InlineColorPicker
                  value={backgroundColor}
                  onChange={onBackgroundChange}
                  presets={BACKGROUND_COLORS}
                />
              </div>
            )}
          </div>
          <Separator />
        </>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search icons..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-8 h-8"
        />
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap gap-1">
        <Button
          size="sm"
          variant={selectedCategory === "all" ? "secondary" : "ghost"}
          className="h-6 px-2 text-xs"
          onClick={() => setSelectedCategory("all")}
        >
          All
        </Button>
        {Object.keys(ICON_CATEGORIES).map((category) => (
          <Button
            key={category}
            size="sm"
            variant={selectedCategory === category ? "secondary" : "ghost"}
            className="h-6 px-2 text-xs"
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </Button>
        ))}
      </div>

      {/* Icon grid */}
      <ScrollArea className="h-[250px]">
        <div className="grid grid-cols-6 gap-1">
          {filteredIcons.map((iconName) => {
            const isSelected = icon === iconName;
            return (
              <button
                key={iconName}
                type="button"
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-lg border transition-colors hover:bg-accent",
                  isSelected && "border-primary bg-accent"
                )}
                onClick={() => handleIconSelect(iconName)}
                title={iconName}
              >
                <DynamicIcon name={iconName} className="h-5 w-5" />
              </button>
            );
          })}
        </div>
        {filteredIcons.length === 0 && (
          <div className="flex items-center justify-center h-20 text-muted-foreground text-sm">
            No icons found
          </div>
        )}
      </ScrollArea>
    </div>
  );

  if (asDialog) {
    return (
      <ResponsiveDialog open={open ?? false} onOpenChange={setOpen ?? (() => {})} variant="modal" size="md" contentClassName={contentClassName}>
        <ResponsiveDialog.Header>
          <ResponsiveDialog.Title>Choose Icon</ResponsiveDialog.Title>
          <ResponsiveDialog.Description className="sr-only">Pick an icon and color.</ResponsiveDialog.Description>
        </ResponsiveDialog.Header>
        <ResponsiveDialog.Body className="px-4 py-2 sm:px-6">
          {content}
        </ResponsiveDialog.Body>
      </ResponsiveDialog>
    );
  }

  return (
    <div className={className}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild disabled={disabled}>
          {trigger || (
            <Button
              variant="outline"
              size="icon"
              className={cn("h-10 w-10", triggerClassName)}
              style={backgroundColor ? { backgroundColor } : undefined}
            >
              <DynamicIcon name={icon} className="h-5 w-5" style={iconStyle} />
            </Button>
          )}
        </PopoverTrigger>
        <PopoverContent
          className={cn("w-80 p-3", contentClassName)}
          align="start"
        >
          {content}
        </PopoverContent>
      </Popover>
    </div>
  );
}

export default IconPicker;
