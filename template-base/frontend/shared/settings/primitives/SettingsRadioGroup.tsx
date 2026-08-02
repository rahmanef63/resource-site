"use client"

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

interface SettingsRadioOption {
  value: string
  label: string
  description?: string
}

interface SettingsRadioGroupProps {
  id: string
  label: string
  description?: string
  value: string
  onValueChange: (value: string) => void
  options: SettingsRadioOption[]
  disabled?: boolean
  className?: string
  orientation?: "horizontal" | "vertical"
}

/**
 * SettingsRadioGroup - A labeled radio group for mutually exclusive options
 * 
 * @example
 * <SettingsRadioGroup
 *   id="theme"
 *   label="Theme"
 *   description="Choose your preferred theme"
 *   value={settings.theme}
 *   onValueChange={(v) => updateSetting('theme', v)}
 *   options={[
 *     { value: 'light', label: 'Light' },
 *     { value: 'dark', label: 'Dark' },
 *     { value: 'system', label: 'System' },
 *   ]}
 * />
 */
export function SettingsRadioGroup({
  id,
  label,
  description,
  value,
  onValueChange,
  options,
  disabled = false,
  className,
  orientation = "vertical",
}: SettingsRadioGroupProps) {
  return (
    <div
      className={cn(
        "rounded-lg border p-3 shadow-sm space-y-3",
        disabled && "opacity-50",
        className
      )}
    >
      <div className="space-y-0.5">
        <Label className="text-sm font-medium">{label}</Label>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </div>
      <RadioGroup
        id={id}
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        className={cn(
          orientation === "horizontal" ? "flex flex-wrap gap-4" : "space-y-2"
        )}
      >
        {options.map((option) => (
          <div key={option.value} className="flex items-center space-x-2">
            <RadioGroupItem value={option.value} id={`${id}-${option.value}`} />
            <Label
              htmlFor={`${id}-${option.value}`}
              className="text-sm font-normal cursor-pointer"
            >
              {option.label}
              {option.description && (
                <span className="block text-xs text-muted-foreground">
                  {option.description}
                </span>
              )}
            </Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  )
}
