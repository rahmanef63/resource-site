"use client"

import React, { useState, useEffect } from "react"
import { MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
  DropdownMenuShortcut,
} from "@/components/ui/dropdown-menu"
import { getCommandsForFeature, CommandDefinition } from "@/frontend/shared/foundation/utils/registry/command-registry"
import { cn } from "@/lib/utils"

interface FeatureActionMenuProps {
  featureSlug: string
  className?: string
}

export function FeatureActionMenu({ featureSlug, className }: FeatureActionMenuProps) {
  const [mounted, setMounted] = useState(false)
  const [actions, setActions] = useState<CommandDefinition[]>([])

  useEffect(() => {
    setMounted(true)
    // Small delay to ensure registry is populated
    const timer = setTimeout(() => {
      const commands = getCommandsForFeature(featureSlug)
      // Filter commands that should appear in the menu
      // We include 'actions', 'danger', and 'other' groups
      // We exclude 'navigation' or 'settings' if they are handled elsewhere
      const menuActions = commands.filter(cmd => 
        ['actions', 'danger', 'other'].includes(cmd.group as string) || !cmd.group
      )
      setActions(menuActions)
    }, 100)
    return () => clearTimeout(timer)
  }, [featureSlug])

  if (!mounted) return null
  if (actions.length === 0) return null

  // Group actions
  const groupedActions = actions.reduce((acc, action) => {
    const group = action.group || "other"
    if (!acc[group]) acc[group] = []
    acc[group].push(action)
    return acc
  }, {} as Record<string, CommandDefinition[]>)

  const groups = Object.keys(groupedActions)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className={cn("h-8 w-8", className)}>
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Actions</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {groups.map((group, index) => (
          <React.Fragment key={group}>
            <DropdownMenuGroup>
              {groupedActions[group].map((action) => (
                <DropdownMenuItem
                  key={action.id}
                  onClick={action.action}
                  className={cn(
                    action.variant === "destructive" && "text-destructive focus:text-destructive"
                  )}
                >
                  {action.icon && <action.icon className="mr-2 h-4 w-4" />}
                  <span>{action.label}</span>
                  {action.shortcut && (
                    <DropdownMenuShortcut>{action.shortcut}</DropdownMenuShortcut>
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
            {index < groups.length - 1 && <DropdownMenuSeparator />}
          </React.Fragment>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
