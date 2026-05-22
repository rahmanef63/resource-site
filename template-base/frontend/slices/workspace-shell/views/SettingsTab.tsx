"use client"

import * as React from "react"
import type { Id } from "@/convex/_generated/dataModel"
import { useNavContext } from "../hooks/useNavContext"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { DEFAULT_WORKSPACE_SHELL_SETTINGS } from "../settings"
import { Building2, Layers } from "lucide-react"

interface SettingsTabProps {
  workspaceId: Id<"workspaces">
}

/**
 * SettingsTab — workspace-shell prefs (P4 minimal).
 *
 * Future: persist to per-workspace settings table. For P4, settings render
 * with defaults + are display-only (toggles work locally). P5+ wires
 * persistence via shared settings primitive.
 */
export function SettingsTab({ workspaceId }: SettingsTabProps) {
  const nav = useNavContext(workspaceId)

  const [showWorkspaceTree, setShowWorkspaceTree] = React.useState<boolean>(
    DEFAULT_WORKSPACE_SHELL_SETTINGS.showWorkspaceTree,
  )
  const [allowUserFork, setAllowUserFork] = React.useState<boolean>(
    DEFAULT_WORKSPACE_SHELL_SETTINGS.allowUserFork,
  )

  return (
    <div className="space-y-6 max-w-2xl">
      <section className="space-y-3">
        <header>
          <h3 className="text-sm font-medium uppercase text-muted-foreground">
            Display
          </h3>
        </header>
        <div className="rounded-md border bg-card divide-y">
          <SettingRow
            id="show-tree"
            icon={Building2}
            label="Show workspace tree in switcher"
            description="Inline nested-workspace hierarchy view inside the dropdown."
            value={showWorkspaceTree}
            onChange={setShowWorkspaceTree}
          />
          <SettingRow
            id="allow-fork"
            icon={Layers}
            label="Allow user fork of menu sets"
            description="Users with menus.fork permission can clone workspace-default menus into personal ones."
            value={allowUserFork}
            onChange={setAllowUserFork}
          />
        </div>
        <p className="text-xs text-muted-foreground italic">
          P4 stub — toggles work locally only. P5 wires persistence to shared
          settings primitive.
        </p>
      </section>

      <section className="space-y-3">
        <header>
          <h3 className="text-sm font-medium uppercase text-muted-foreground">
            Current context
          </h3>
        </header>
        <dl className="grid grid-cols-[140px_1fr] gap-x-4 gap-y-1 rounded-md border bg-card p-4 text-sm">
          <dt className="text-muted-foreground">workspace</dt>
          <dd>{nav.workspace?.name ?? "—"}</dd>
          <dt className="text-muted-foreground">menu set</dt>
          <dd>{nav.menuSet?.name ?? "—"}</dd>
          <dt className="text-muted-foreground">resolved via</dt>
          <dd>{nav.source}</dd>
          <dt className="text-muted-foreground">effective items</dt>
          <dd>{nav.effectiveMenuItems.length}</dd>
        </dl>
      </section>
    </div>
  )
}

function SettingRow({
  id,
  icon: Icon,
  label,
  description,
  value,
  onChange,
}: {
  id: string
  icon: typeof Building2
  label: string
  description: string
  value: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <div className="flex items-start gap-3 px-4 py-3">
      <Icon className="h-4 w-4 mt-0.5 opacity-60" />
      <div className="flex-1 space-y-1">
        <Label htmlFor={id} className="cursor-pointer font-medium">
          {label}
        </Label>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <Switch id={id} checked={value} onCheckedChange={onChange} />
    </div>
  )
}
