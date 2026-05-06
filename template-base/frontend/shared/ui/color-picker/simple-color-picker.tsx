/**
 * Simple Color Picker - Compact full-featured color picker
 * 
 * A pre-composed color picker with all controls in a compact layout.
 * 
 * @example
 * <SimpleColorPicker value={color} onChange={setColor} />
 */

"use client";

import * as React from "react";
import Color from "color";
import { cn } from "@/lib/utils";
import {
  ColorPicker,
  ColorPickerSelection,
  ColorPickerHue,
  ColorPickerAlpha,
  ColorPickerEyeDropper,
  ColorPickerOutput,
  ColorPickerFormat,
  type ColorPickerProps,
} from "@/components/ui/shadcn-io/color-picker";

export interface SimpleColorPickerProps {
  /** Current color value (hex, rgb, hsl, etc.) */
  value?: string;
  /** Callback when color changes */
  onChange?: (color: string) => void;
  /** Show alpha slider */
  showAlpha?: boolean;
  /** Show eye dropper button */
  showEyeDropper?: boolean;
  /** Show format selector and output */
  showOutput?: boolean;
  /** Selection area height */
  selectionHeight?: number;
  /** Container class name */
  className?: string;
}

/**
 * SimpleColorPicker - Full-featured color picker in compact form
 */
export function SimpleColorPicker({
  value = "#3B82F6",
  onChange,
  showAlpha = true,
  showEyeDropper = true,
  showOutput = true,
  selectionHeight = 150,
  className,
}: SimpleColorPickerProps) {
  
  // The ColorPicker onChange passes [r, g, b, alpha] as array
  const handleChange = React.useCallback((rgba: number[]) => {
    if (onChange && Array.isArray(rgba)) {
      try {
        const [r, g, b, a = 1] = rgba;
        const color = Color.rgb(r, g, b).alpha(a);
        onChange(color.hex());
      } catch {
        // Invalid color
      }
    }
  }, [onChange]);

  return (
    <ColorPicker
      value={value}
      onChange={handleChange as unknown as ColorPickerProps['onChange']}
      className={cn("max-w-sm rounded-md border bg-background p-4 shadow-sm", className)}
    >
      <ColorPickerSelection style={{ height: selectionHeight }} />
      
      <div className="flex items-center gap-4">
        {showEyeDropper && <ColorPickerEyeDropper />}
        <div className="grid w-full gap-1">
          <ColorPickerHue />
          {showAlpha && <ColorPickerAlpha />}
        </div>
      </div>
      
      {showOutput && (
        <div className="flex items-center gap-2">
          <ColorPickerOutput />
          <ColorPickerFormat />
        </div>
      )}
    </ColorPicker>
  );
}

export default SimpleColorPicker;
