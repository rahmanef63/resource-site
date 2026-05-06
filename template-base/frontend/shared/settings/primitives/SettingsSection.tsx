"use client"

import { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface SettingsSectionProps {
  title: string
  description?: string
  children: ReactNode
  className?: string
}

/**
 * SettingsSection - Container for grouping related settings
 * 
 * @example
 * <SettingsSection title="General" description="Basic chat settings">
 *   <SettingsToggle ... />
 *   <SettingsSelect ... />
 * </SettingsSection>
 */
export function SettingsSection({
  title,
  description,
  children,
  className,
}: SettingsSectionProps) {
  return (
    <div className={cn("space-y-4", className)}>
      <div className="space-y-1">
        <h3 className="text-sm font-medium leading-none">{title}</h3>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  )
}
