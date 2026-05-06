/**
 * Preset Color Picker - Color selection from predefined swatches
 * 
 * A compact inline color picker using preset color swatches.
 * Supports optional custom color input.
 * 
 * @example
 * <PresetColorPicker 
 *   value={color} 
 *   onChange={setColor}
 *   presets={["#FF0000", "#00FF00", "#0000FF"]}
 * />
 */

"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { WORKSPACE_COLORS, type WorkspaceColorOption } from "@/frontend/shared/constants/colors";

// Default preset colors extracted from WORKSPACE_COLORS
const DEFAULT_PRESET_COLORS = WORKSPACE_COLORS.map(c => c.value);

export type ColorPickerVariant = "default" | "inline" | "preset";

export interface PresetColorPickerProps {
  /** Current selected color value */
  value?: string;
  /** Callback when color is selected */
  onChange?: (color: string) => void;
  /** Preset colors to display (array of hex strings, defaults to WORKSPACE_COLORS) */
  presets?: string[];
  /** Show custom color input */
  showCustom?: boolean;
  /** Container class name */
  className?: string;
  /** Disabled state */
  disabled?: boolean;
  /** Variant style */
  variant?: ColorPickerVariant;
}

/**
 * PresetColorPicker - Color selection from preset swatches
 */
export function PresetColorPicker({
  value,
  onChange,
  presets = DEFAULT_PRESET_COLORS,
  showCustom = false,
  className,
  disabled = false,
  variant = "default",
}: PresetColorPickerProps) {
  const [customColor, setCustomColor] = React.useState(value || "#3B82F6");
  
  const handleColorSelect = (color: string) => {
    onChange?.(color);
  };

  const handleCustomSubmit = () => {
    if (customColor) {
      onChange?.(customColor);
    }
  };

  const swatchSize = variant === "inline" ? "w-6 h-6" : "w-8 h-8";
  const gap = variant === "inline" ? "gap-1" : "gap-2";

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {/* Preset swatches */}
      <div className={cn("flex flex-wrap", gap)}>
        {presets.map((color) => (
          <button
            key={color}
            type="button"
            disabled={disabled}
            onClick={() => handleColorSelect(color)}
            className={cn(
              swatchSize,
              "rounded-md border-2 transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
              value === color ? "border-primary ring-2 ring-primary ring-offset-2" : "border-transparent",
              disabled && "opacity-50 cursor-not-allowed hover:scale-100"
            )}
            style={{ backgroundColor: color }}
            title={color}
          />
        ))}
      </div>

      {/* Custom color input */}
      {showCustom && (
        <div className="flex items-center gap-2 pt-2 border-t">
          <input
            type="color"
            value={customColor}
            onChange={(e) => setCustomColor(e.target.value)}
            className="w-8 h-8 cursor-pointer rounded border"
            disabled={disabled}
          />
          <input
            type="text"
            value={customColor}
            onChange={(e) => setCustomColor(e.target.value)}
            className="flex-1 px-2 py-1 text-sm border rounded"
            placeholder="#FFFFFF"
            disabled={disabled}
          />
          <Button 
            variant="secondary" 
            size="sm" 
            onClick={handleCustomSubmit}
            disabled={disabled}
          >
            Apply
          </Button>
        </div>
      )}
    </div>
  );
}

export interface InlineColorPickerProps extends Omit<PresetColorPickerProps, 'variant'> {
  /** Trigger button class name */
  triggerClassName?: string;
}

/**
 * InlineColorPicker - Popover-based color picker with trigger button
 */
export function InlineColorPicker({
  value,
  onChange,
  presets = DEFAULT_PRESET_COLORS,
  showCustom = false,
  className,
  triggerClassName,
  disabled = false,
}: InlineColorPickerProps) {
  const [open, setOpen] = React.useState(false);

  const handleSelect = (color: string) => {
    onChange?.(color);
    if (!showCustom) {
      setOpen(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          className={cn(
            "w-8 h-8 rounded-md border-2 border-muted hover:border-primary transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
            disabled && "opacity-50 cursor-not-allowed",
            triggerClassName
          )}
          style={{ backgroundColor: value || "#3B82F6" }}
          title={value || "Select color"}
        />
      </PopoverTrigger>
      <PopoverContent className={cn("w-auto p-3", className)} align="start">
        <PresetColorPicker
          value={value}
          onChange={handleSelect}
          presets={presets}
          showCustom={showCustom}
          variant="inline"
          disabled={disabled}
        />
      </PopoverContent>
    </Popover>
  );
}

export default PresetColorPicker;
