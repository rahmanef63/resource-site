"use client"

import { Switch } from "@/components/ui/switch"
import { Globe, Building2 } from "lucide-react"
import { cn } from "@/lib/utils"

export interface GlobalModeToggleProps {
  /** Whether global mode is enabled */
  isGlobal: boolean
  /** Callback when toggle changes */
  onToggle: (isGlobal: boolean) => void
  /** Optional label to display (default: "Global") */
  label?: string
  /** Show icons instead of/with label */
  showIcons?: boolean
  /** Size variant */
  size?: "sm" | "md"
  /** Additional class names */
  className?: string
  /** Disabled state */
  disabled?: boolean
}

/**
 * Shared toggle component for switching between workspace-specific and global (private) mode.
 * Used across features like Chat, AI, etc. to differentiate workspace vs personal items.
 * 
 * - Workspace mode: Items are tied to current workspace, visible to workspace members
 * - Global mode: Items are private/personal, not tied to any workspace
 */
export function GlobalModeToggle({
  isGlobal,
  onToggle,
  label = "Global",
  showIcons = false,
  size = "sm",
  className,
  disabled = false,
}: GlobalModeToggleProps) {
  const textSize = size === "sm" ? "text-xs" : "text-sm"
  const iconSize = size === "sm" ? "h-3 w-3" : "h-4 w-4"

  return (
    <div className={cn("flex items-center gap-2", textSize, "text-muted-foreground", className)}>
      {showIcons && (
        <Building2 
          className={cn(iconSize, !isGlobal && "text-primary")} 
          aria-label="Workspace mode"
        />
      )}
      <span className={cn(showIcons && "sr-only")}>{label}</span>
      <Switch
        checked={isGlobal}
        onCheckedChange={onToggle}
        disabled={disabled}
        aria-label={`Toggle ${label} mode`}
        className={cn(size === "sm" && "scale-90")}
      />
      {showIcons && (
        <Globe 
          className={cn(iconSize, isGlobal && "text-primary")} 
          aria-label="Global mode"
        />
      )}
    </div>
  )
}
