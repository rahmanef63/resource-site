"use client"

import * as React from "react"
import { MoreHorizontal } from "lucide-react"
import type { HeaderActionGroup } from "../types"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuGroup,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"

interface HeaderActionGroupProps {
  group: HeaderActionGroup
  className?: string
}

export const HeaderActionGroupMenu: React.FC<HeaderActionGroupProps> = ({
  group,
  className,
}) => {
  const TriggerIcon = group.trigger?.icon ?? MoreHorizontal

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="default" className={className}>
          <TriggerIcon className="h-4 w-4" />
          {!group.trigger?.iconOnly && group.trigger?.label}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {group.label && <DropdownMenuLabel>{group.label}</DropdownMenuLabel>}
        {group.label && <DropdownMenuSeparator />}
        <DropdownMenuGroup>
          {group.actions.map((action) => {
            const ActionIcon = action.icon
            return (
              <DropdownMenuItem
                key={action.id}
                onClick={action.onClick}
                disabled={action.disabled}
              >
                {ActionIcon && <ActionIcon className="mr-2 h-4 w-4" />}
                {action.label}
                {action.shortcut && (
                  <span className="ml-auto text-xs text-muted-foreground">
                    {action.shortcut}
                  </span>
                )}
              </DropdownMenuItem>
            )
          })}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
HeaderActionGroupMenu.displayName = "HeaderActionGroupMenu"
