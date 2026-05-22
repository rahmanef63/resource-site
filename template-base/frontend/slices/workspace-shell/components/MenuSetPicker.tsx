"use client"

import * as React from "react"
import type { Doc, Id } from "@/convex/_generated/dataModel"
import {
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import { Plus, Users, User, Cog } from "lucide-react"

interface MenuSetPickerProps {
  currentMenuSetId: Id<"workspaceShell_menuSets"> | null
  menuSets: {
    user: Doc<"workspaceShell_menuSets">[]
    workspace: Doc<"workspaceShell_menuSets">[]
    system: Doc<"workspaceShell_menuSets">[]
  }
  canFork?: boolean
  onSelect: (menuSetId: Id<"workspaceShell_menuSets"> | null) => void
  onFork?: () => void
}

const sourceIcon = {
  user: User,
  workspace: Users,
  system: Cog,
}

/**
 * MenuSetPicker — radio-style picker for the 3 menuSet tiers.
 * Embedded inline in WorkspaceSwitcher dropdown (no nested submenu — flat for
 * easier mobile interaction).
 */
export function MenuSetPicker({
  currentMenuSetId,
  menuSets,
  canFork = false,
  onSelect,
  onFork,
}: MenuSetPickerProps) {
  const currentValue = currentMenuSetId ? String(currentMenuSetId) : "__none__"

  const sections: Array<{
    key: "user" | "workspace" | "system"
    label: string
    items: Doc<"workspaceShell_menuSets">[]
  }> = [
    { key: "user", label: "Your menus", items: menuSets.user },
    { key: "workspace", label: "Workspace menus", items: menuSets.workspace },
    { key: "system", label: "System menus", items: menuSets.system },
  ]

  const hasAny = sections.some((s) => s.items.length > 0)

  return (
    <div>
      <DropdownMenuLabel className="text-xs uppercase tracking-wide text-muted-foreground">
        Menu set
      </DropdownMenuLabel>
      <DropdownMenuRadioGroup
        value={currentValue}
        onValueChange={(v) => {
          if (v === "__none__") onSelect(null)
          else onSelect(v as Id<"workspaceShell_menuSets">)
        }}
      >
        <DropdownMenuRadioItem value="__none__" className="text-muted-foreground">
          (auto-resolve)
        </DropdownMenuRadioItem>
        {!hasAny && (
          <div className="px-2 py-1.5 text-xs text-muted-foreground">
            No menu sets available
          </div>
        )}
        {sections.map((section) => {
          if (section.items.length === 0) return null
          const Icon = sourceIcon[section.key]
          return (
            <React.Fragment key={section.key}>
              <DropdownMenuSeparator />
              <DropdownMenuLabel className="flex items-center gap-1.5 text-[10px] uppercase tracking-wide text-muted-foreground">
                <Icon className="h-3 w-3" />
                {section.label}
              </DropdownMenuLabel>
              {section.items.map((ms) => (
                <DropdownMenuRadioItem key={ms._id} value={String(ms._id)}>
                  <span className="truncate">{ms.name}</span>
                  {ms.isDefault && (
                    <span className="ml-auto text-xs text-muted-foreground">default</span>
                  )}
                </DropdownMenuRadioItem>
              ))}
            </React.Fragment>
          )
        })}
      </DropdownMenuRadioGroup>
      {canFork && onFork && (
        <>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={onFork}>
            <Plus className="mr-2 h-4 w-4" />
            Fork current as my menu…
          </DropdownMenuItem>
        </>
      )}
    </div>
  )
}
