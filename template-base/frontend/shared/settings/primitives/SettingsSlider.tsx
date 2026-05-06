"use client"

import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { useId } from "react"

interface SettingsSliderProps {
  id?: string
  label: string
  description?: string
  value: number | number[]
  onValueChange: (value: number[]) => void
  min?: number
  max?: number
  step?: number
  disabled?: boolean
  className?: string
  showValue?: boolean
  valueFormatter?: (value: number) => string
}

/**
 * SettingsSlider - A labeled slider for numeric range settings
 * 
 * @example
 * <SettingsSlider
 *   label="Notification Volume"
 *   description="Adjust notification sound level"
 *   value={[settings.volume]}
 *   onValueChange={(v) => updateSetting('volume', v[0])}
 *   min={0}
 *   max={100}
 *   showValue
 *   valueFormatter={(v) => `${v}%`}
 * />
 */
export function SettingsSlider({
  id,
  label,
  description,
  value,
  onValueChange,
  min = 0,
  max = 100,
  step = 1,
  disabled = false,
  className,
  showValue = true,
  valueFormatter = (v) => String(v),
}: SettingsSliderProps) {
  const autoId = useId()
  const elementId = id || autoId
  
  // Normalize value to array
  const normalizedValue = Array.isArray(value) ? value : [value]
  const displayValue = normalizedValue[0] ?? 0

  return (
    <div
      className={cn(
        "rounded-lg border p-3 shadow-sm space-y-3",
        disabled && "opacity-50",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label htmlFor={elementId} className="text-sm font-medium">
            {label}
          </Label>
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
        </div>
        {showValue && (
          <span className="text-sm font-medium text-muted-foreground">
            {valueFormatter(displayValue)}
          </span>
        )}
      </div>
      <Slider
        id={elementId}
        value={normalizedValue}
        onValueChange={onValueChange}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        className="w-full"
      />
    </div>
  )
}
