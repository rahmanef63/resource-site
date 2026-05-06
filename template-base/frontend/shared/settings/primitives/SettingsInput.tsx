"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

interface SettingsInputProps {
  id: string
  label: string
  description?: string
  value: string
  onValueChange: (value: string) => void
  placeholder?: string
  type?: "text" | "email" | "number" | "url"
  disabled?: boolean
  className?: string
}

/**
 * SettingsInput - A labeled text input for string/number settings
 * 
 * @example
 * <SettingsInput
 *   id="display-name"
 *   label="Display Name"
 *   description="Your name shown to others"
 *   value={settings.displayName}
 *   onValueChange={(v) => updateSetting('displayName', v)}
 *   placeholder="Enter your name"
 * />
 */
export function SettingsInput({
  id,
  label,
  description,
  value,
  onValueChange,
  placeholder,
  type = "text",
  disabled = false,
  className,
}: SettingsInputProps) {
  return (
    <div
      className={cn(
        "rounded-lg border p-3 shadow-sm space-y-2",
        disabled && "opacity-50",
        className
      )}
    >
      <div className="space-y-0.5">
        <Label htmlFor={id} className="text-sm font-medium">
          {label}
        </Label>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </div>
      <Input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full"
      />
    </div>
  )
}
