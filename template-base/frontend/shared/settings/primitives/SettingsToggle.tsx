"use client"

import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { useId } from "react"

export interface SettingsToggleProps {
  id?: string
  label: string
  description?: string
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  disabled?: boolean
  className?: string
}

/**
 * SettingsToggle - A labeled switch/toggle for boolean settings
 * 
 * @example
 * <SettingsToggle
 *   label="Enable Notifications"
 *   description="Receive push notifications"
 *   checked={settings.notifications}
 *   onCheckedChange={(v) => updateSetting('notifications', v)}
 * />
 */
export function SettingsToggle({
  id,
  label,
  description,
  checked,
  onCheckedChange,
  disabled = false,
  className,
}: SettingsToggleProps) {
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
      <div className="space-y-0.5">
        <Label htmlFor={elementId} className="text-sm font-medium cursor-pointer">
          {label}
        </Label>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </div>
      <Switch
        id={elementId}
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
      />
    </div>
  )
}
