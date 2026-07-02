"use client"

import { useMemo, useState } from "react"
import {
  ClipboardList,
  Loader2,
  CheckCircle2,
  Layers,
  ListTodo,
} from "lucide-react"
import {
  FeatureShell,
  type ShellTabItem,
} from "@/frontend/shared/ui/layout/feature-shell"
import { useWorkspaceContext } from "@/frontend/shared/foundation/provider/WorkspaceProvider"
import { TaskList } from "../components/TaskList"
import { NewTaskDialog } from "../components/NewTaskDialog"

/**
 * Staff Operations entrypoint view. Renders FeatureShell with four canonical
 * task buckets (Open / In Progress / Completed / All) — each tab is a
 * filtered TaskList query keyed on workspaceId + status.
 *
 * Mounted from `frontend/slices/staff-operations/page.tsx` — page.tsx keeps a
 * top-level FeatureShell-with-featureId="staff-operations" mount to satisfy
 * the static layout contract test (page.layout.test.tsx).
 */
export function StaffOperationsView() {
  const { workspaceId } = useWorkspaceContext()
  const [activeTab, setActiveTab] = useState<string>("open")

  const tabs = useMemo<ShellTabItem[]>(() => {
    if (!workspaceId) return []
    return [
      {
        value: "open",
        label: "Open",
        icon: ListTodo,
        content: <TaskList workspaceId={workspaceId} statusFilter="open" />,
      },
      {
        value: "in-progress",
        label: "In Progress",
        icon: Loader2,
        content: <TaskList workspaceId={workspaceId} statusFilter="in-progress" />,
      },
      {
        value: "completed",
        label: "Completed",
        icon: CheckCircle2,
        content: <TaskList workspaceId={workspaceId} statusFilter="completed" />,
      },
      {
        value: "all",
        label: "All",
        icon: Layers,
        content: <TaskList workspaceId={workspaceId} />,
      },
    ]
  }, [workspaceId])

  if (!workspaceId) {
    return (
      <FeatureShell featureId="staff-operations" centered padding>
        <div className="text-center">
          <ClipboardList className="mx-auto h-10 w-10 text-muted-foreground" />
          <h2 className="mt-3 text-lg font-semibold">No workspace selected</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Select a workspace to manage staff operations tasks.
          </p>
        </div>
      </FeatureShell>
    )
  }

  return (
    <FeatureShell
      featureId="staff-operations"
      padding
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >
      <div className="flex items-center justify-between gap-3 pb-2">
        <div>
          <h1 className="text-lg font-semibold">Staff Operations</h1>
          <p className="text-xs text-muted-foreground">
            Housekeeping, laundry, damage reports, and shift work — assignable per task.
          </p>
        </div>
        <NewTaskDialog workspaceId={workspaceId} />
      </div>
    </FeatureShell>
  )
}

export default StaffOperationsView
