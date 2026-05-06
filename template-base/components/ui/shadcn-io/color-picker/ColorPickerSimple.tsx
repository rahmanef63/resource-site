"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import Color from "color"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  ColorPicker,
  ColorPickerSelection,
  ColorPickerHue,
  ColorPickerAlpha,
  ColorPickerEyeDropper,
  ColorPickerFormat,
  ColorPickerOutput,
  type ColorPickerProps,
} from "./index"

interface ColorPickerSimpleProps {
  value: string
  onChange: (color: string) => void
  className?: string
  placeholder?: string
  showInput?: boolean
  showAlpha?: boolean
}

// Type for the onChange callback from ColorPicker
type ColorValue = Parameters<typeof Color.rgb>[0]

/**
 * Simple color picker component that wraps the shadcn-io color picker.
 * Provides hex input, color picker popover with hue/saturation/alpha sliders.
 */
export function ColorPickerSimple({
  value,
  onChange,
  className,
  placeholder = "#000000",
  showInput = true,
  showAlpha = false,
}: ColorPickerSimpleProps) {
  const [open, setOpen] = useState(false)
  // Track internal color to prevent infinite loops
  const [internalColor, setInternalColor] = useState(value || placeholder)
  const isExternalUpdate = useRef(false)

  // Sync from external value when it changes
  useEffect(() => {
    if (value !== internalColor) {
      isExternalUpdate.current = true
      setInternalColor(value || placeholder)
    }
  }, [value, placeholder, internalColor])

  const handleChange = useCallback(
    (colorValue: ColorValue) => {
      // Skip if this is triggered by external value sync
      if (isExternalUpdate.current) {
        isExternalUpdate.current = false
        return
      }

      try {
        let newColor: string
        // colorValue is an array [r, g, b, a] or similar
        if (Array.isArray(colorValue)) {
          const [r, g, b, a] = colorValue as number[]
          const color = Color.rgb(r, g, b, a ?? 1)
          if (showAlpha && a !== undefined && a < 1) {
            // Return rgba format for alpha values
            newColor = `rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}, ${(a ?? 1).toFixed(2)})`
          } else {
            // Return hex for solid colors
            newColor = color.hex()
          }
        } else {
          // If it's already a color string or object
          const color = Color(colorValue)
          newColor = color.hex()
        }

        // Only update if color actually changed
        if (newColor !== internalColor) {
          setInternalColor(newColor)
          onChange(newColor)
        }
      } catch {
        // Ignore parsing errors
      }
    },
    [onChange, showAlpha, internalColor]
  )

  const displayColor = internalColor || placeholder

  return (
    <div className={cn("flex gap-2", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="h-10 w-14 shrink-0 p-1"
            type="button"
          >
            <div
              className="h-full w-full rounded border"
              style={{ backgroundColor: displayColor }}
            />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-3" align="start">
          <ColorPicker
            value={internalColor || "#000000"}
            onChange={handleChange}
            className="gap-3"
          >
            <ColorPickerSelection className="h-32" />
            <ColorPickerHue />
            {showAlpha && <ColorPickerAlpha />}
            <div className="flex items-center gap-2">
              <ColorPickerOutput />
              <ColorPickerEyeDropper />
            </div>
            <ColorPickerFormat />
          </ColorPicker>
        </PopoverContent>
      </Popover>

      {showInput && (
        <Input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="h-10 flex-1 font-mono text-sm"
        />
      )}
    </div>
  )
}

export default ColorPickerSimple
