"use client"

import type { Id } from "@/convex/_generated/dataModel"
import { WorkspaceShellEditor } from "./views/WorkspaceShellEditor"

interface WorkspaceShellPageProps {
  workspaceId?: Id<"workspaces"> | null
}

/**
 * workspace-shell page (P4 — full editor with tabs).
 *
 * Tabs: menus / workspace tree / settings. URL routing via ?tab=<key>.
 * Drag-n-drop tree reorder + visual menu builder deferred to follow-up.
 */
export default function WorkspaceShellPage({ workspaceId }: WorkspaceShellPageProps) {
  if (!workspaceId) {
    return (
      <div className="flex h-full items-center justify-center p-8 text-center">
        <div className="space-y-2 max-w-md">
          <h2 className="text-lg font-semibold">Workspace Shell</h2>
          <p className="text-sm text-muted-foreground">
            Select a workspace from the switcher to manage its navigation tree
            and menu sets.
          </p>
        </div>
      </div>
    )
  }

  return <WorkspaceShellEditor workspaceId={workspaceId} />
}
