"use client"

import * as React from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  ResponsiveDialog,
} from "@/frontend/shared/ui/components/ResponsiveDialog"
import { useWorkspaceContext } from "@/frontend/shared/foundation/provider/WorkspaceProvider"
import { useNavContext } from "../hooks/useNavContext"
import { ContextBadge } from "./ContextBadge"
import { MenuSetPicker } from "./MenuSetPicker"
import { Cog, Layers, Plus } from "lucide-react"
import type { Id } from "@/convex/_generated/dataModel"

interface WorkspaceSwitcherProps {
  /** Render the trigger as compact chip (default: button). */
  compact?: boolean
  /** Whether the user can fork menuSet (caller checks `menus.fork` perm). */
  canFork?: boolean
  /** Show "Manage…" footer links. */
  showFooterLinks?: boolean
  className?: string
}

/**
 * WorkspaceSwitcher v2 — atomic 2-axis switcher (workspace × menuSet).
 *
 * Reads from existing WorkspaceProvider (workspaceId, workspaces list) AND
 * NavContext (menuSetId, availableMenuSets). Each axis updates independently
 * for now; P5 unifies into single setNavContext call.
 *
 * P0/P3 — built as new component sibling to legacy WorkspaceSwitcher in
 * frontend/shared/ui/layout/sidebar/workspace-switcher. Legacy stays mounted
 * via deprecation shim until 2026-06-19 (P6).
 */
export function WorkspaceSwitcher({
  compact,
  canFork = false,
  showFooterLinks = true,
  className,
}: WorkspaceSwitcherProps) {
  const { workspaceId, workspaces, currentWorkspace, setWorkspaceId } =
    useWorkspaceContext()

  const nav = useNavContext(workspaceId)
  const [forkOpen, setForkOpen] = React.useState(false)

  const wsList = workspaces ?? []
  const currentValue = workspaceId ? String(workspaceId) : ""

  const handleSelectWorkspace = React.useCallback(
    (value: string) => {
      if (!value || value === currentValue) return
      setWorkspaceId(value as Id<"workspaces">)
    },
    [currentValue, setWorkspaceId],
  )

  const handleSelectMenuSet = React.useCallback(
    async (menuSetId: Id<"workspaceShell_menuSets"> | null) => {
      try {
        await nav.setMenuSet(menuSetId)
      } catch (err) {
        console.error("WorkspaceSwitcher.setMenuSet failed", err)
      }
    },
    [nav],
  )

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button type="button" className={className}>
            <ContextBadge
              workspaceName={currentWorkspace?.name ?? null}
              menuSetName={nav.menuSet?.name ?? null}
              loading={nav.loading}
              compact={compact}
            />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-72">
          {/* Workspace tier */}
          <DropdownMenuLabel className="text-xs uppercase tracking-wide text-muted-foreground">
            Workspace
          </DropdownMenuLabel>
          <DropdownMenuRadioGroup value={currentValue} onValueChange={handleSelectWorkspace}>
            {wsList.length === 0 && (
              <div className="px-2 py-1.5 text-xs text-muted-foreground">
                No workspaces
              </div>
            )}
            {wsList.map((ws) => (
              <DropdownMenuRadioItem key={ws._id} value={String(ws._id)}>
                <span className="truncate">{ws.name}</span>
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>

          <DropdownMenuSeparator />

          {/* MenuSet tier */}
          <MenuSetPicker
            currentMenuSetId={nav.menuSetId}
            menuSets={nav.availableMenuSets}
            canFork={canFork && !!nav.menuSet}
            onSelect={handleSelectMenuSet}
            onFork={() => setForkOpen(true)}
          />

          {showFooterLinks && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <a href="/dashboard/workspace-shell" className="flex items-center">
                  <Cog className="mr-2 h-4 w-4" />
                  Manage workspace shell
                </a>
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <ForkMenuSetDialog
        open={forkOpen}
        onOpenChange={setForkOpen}
        sourceName={nav.menuSet?.name ?? null}
        onConfirm={async (name) => {
          if (!nav.menuSetId) return
          await nav.forkMenuSet(nav.menuSetId, name)
          setForkOpen(false)
        }}
      />
    </>
  )
}

interface ForkMenuSetDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  sourceName: string | null
  onConfirm: (name: string) => Promise<void>
}

function ForkMenuSetDialog({
  open,
  onOpenChange,
  sourceName,
  onConfirm,
}: ForkMenuSetDialogProps) {
  const [name, setName] = React.useState("")
  const [saving, setSaving] = React.useState(false)

  React.useEffect(() => {
    if (open && sourceName) setName(`My ${sourceName}`)
  }, [open, sourceName])

  const handleSave = async () => {
    if (!name.trim()) return
    setSaving(true)
    try {
      await onConfirm(name.trim())
    } finally {
      setSaving(false)
    }
  }

  return (
    <ResponsiveDialog open={open} onOpenChange={onOpenChange}>
      <ResponsiveDialog.Header>
        <ResponsiveDialog.Title>Fork menu set</ResponsiveDialog.Title>
        <ResponsiveDialog.Description>
          Create a personal copy of <strong>{sourceName ?? "this menu"}</strong>{" "}
          that only you can edit.
        </ResponsiveDialog.Description>
      </ResponsiveDialog.Header>
      <ResponsiveDialog.Body className="space-y-3">
        <div className="space-y-2">
          <Label htmlFor="fork-name">Name</Label>
          <Input
            id="fork-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="My custom menu"
            autoFocus
          />
        </div>
      </ResponsiveDialog.Body>
      <ResponsiveDialog.Footer>
        <Button variant="outline" onClick={() => onOpenChange(false)}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={!name.trim() || saving}>
          {saving ? "Forking…" : (<><Plus className="mr-1 h-4 w-4" />Fork</>)}
        </Button>
      </ResponsiveDialog.Footer>
    </ResponsiveDialog>
  )
}
