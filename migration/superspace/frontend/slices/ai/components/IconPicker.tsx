/**
 * AI Feature IconPicker — thin adapter over the shared icon picker.
 * Maps the old `value`/`onValueChange` API to the shared `icon`/`onIconChange` API.
 */
"use client"

import { IconPicker as SharedIconPicker } from "@/frontend/shared/ui/icons"
import type { IconName } from "@/frontend/shared/ui/icons"

interface AIIconPickerProps {
  value?: string
  onValueChange: (icon: string) => void
  className?: string
}

export function IconPicker({ value, onValueChange, className }: AIIconPickerProps) {
  return (
    <SharedIconPicker
      icon={value as IconName | undefined}
      onIconChange={(name) => onValueChange(name)}
      className={className}
    />
  )
}
