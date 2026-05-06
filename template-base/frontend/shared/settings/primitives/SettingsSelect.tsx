"use client"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { useId } from "react"

interface SettingsSelectOption {
  value: string
  label: string
  description?: string
}

export interface SettingsSelectProps {
  id?: string
  label: string
  description?: string
  value: string
  onValueChange: (value: string) => void
  options: SettingsSelectOption[]
  placeholder?: string
  disabled?: boolean
  className?: string
}

/**
 * SettingsSelect - A labeled dropdown select for enum settings
 * 
 * @example
 * <SettingsSelect
 *   label="Default View"
 *   description="Choose how tasks are displayed"
 *   value={settings.defaultView}
 *   onValueChange={(v) => updateSetting('defaultView', v)}
 *   options={[
 *     { value: 'list', label: 'List View' },
 *     { value: 'board', label: 'Board View' },
 *   ]}
 * />
 */
export function SettingsSelect({
  id,
  label,
  description,
  value,
  onValueChange,
  options,
  placeholder = "Select an option",
  disabled = false,
  className,
}: SettingsSelectProps) {
  const autoId = useId()
  const elementId = id || autoId

  return (
    <div
      className={cn(
        "flex items-center justify-between rounded-lg border p-3 shadow-sm",
        disabled && "opacity-50",
        className
      )}
    >
      <div className="space-y-0.5 flex-1 mr-4">
        <Label htmlFor={elementId} className="text-sm font-medium">
          {label}
        </Label>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </div>
      <Select value={value} onValueChange={onValueChange} disabled={disabled}>
        <SelectTrigger id={elementId} className="w-[180px]">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
