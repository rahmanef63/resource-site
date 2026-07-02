"use client"

import React, { useMemo, useState } from "react"
import { Wrench } from "lucide-react"
import type { Id } from "@convex/_generated/dataModel"
import { FeatureShell } from "@/frontend/shared/ui/layout/feature-shell"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useMaintenance, isOverdue } from "../hooks/useMaintenance"
import { TaskStatsCards } from "../components/TaskStatsCards"
import { TaskList } from "../components/TaskList"
import { TaskCreateDialog } from "../components/TaskCreateDialog"
import { TaskDetailDrawer } from "../components/TaskDetailDrawer"
import type { MaintenanceTask, TaskStatus } from "../types"

type TabValue = "all" | "dueSoon" | TaskStatus

interface MaintenanceSchedulingPageProps {
  workspaceId?: Id<"workspaces"> | null
}

export default function MaintenanceSchedulingPage({
  workspaceId,
}: MaintenanceSchedulingPageProps) {
  const { items, dueSoon, summary, isLoading, scheduleTask, completeTask, skipTask } =
    useMaintenance(workspaceId)
  const [tab, setTab] = useState<TabValue>("all")
  const [selected, setSelected] = useState<MaintenanceTask | null>(null)

  const overdueCount = useMemo(
    () => items.filter((i) => isOverdue(i)).length,
    [items],
  )

  const filtered = useMemo(() => {
    switch (tab) {
      case "all":
        return items
      case "dueSoon":
        return dueSoon
      case "overdue":
        return items.filter((i) => isOverdue(i))
      default:
        return items.filter((i) => i.status === tab)
    }
  }, [items, dueSoon, tab])

  if (!workspaceId) {
    return (
      <FeatureShell featureId="maintenance-scheduling" padding centered>
        <div className="text-center">
          <Wrench className="mx-auto h-10 w-10 text-muted-foreground" />
          <h2 className="mt-4 text-lg font-semibold">No workspace selected</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Select a workspace to schedule maintenance tasks.
          </p>
        </div>
      </FeatureShell>
    )
  }

  return (
    <FeatureShell
      featureId="maintenance-scheduling"
      padding
      maxWidth="full"
      aiPlaceholder="Ask about overdue tasks, scheduled maintenance, or cost tracking…"
      inspector={
        selected ? (
          <TaskDetailDrawer
            task={selected}
            onClose={() => setSelected(null)}
            onComplete={async (id, input) => {
              await completeTask(id, input)
              setSelected(null)
            }}
            onSkip={async (id, input) => {
              await skipTask(id, input)
              setSelected(null)
            }}
          />
        ) : undefined
      }
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="flex items-center gap-2 text-xl font-semibold">
              <Wrench className="h-5 w-5" />
              Maintenance Scheduling
            </h1>
            <p className="text-sm text-muted-foreground">
              Preventive and reactive maintenance with recurring schedules and cost tracking.
            </p>
          </div>
          <TaskCreateDialog onCreate={scheduleTask} />
        </div>

        <TaskStatsCards summary={summary} />

        <Tabs value={tab} onValueChange={(v) => setTab(v as TabValue)}>
          <TabsList className="inline-flex flex-wrap">
            <TabsTrigger value="all">All ({items.length})</TabsTrigger>
            <TabsTrigger value="dueSoon">Due soon ({dueSoon.length})</TabsTrigger>
            <TabsTrigger value="scheduled">
              Scheduled ({items.filter((i) => i.status === "scheduled").length})
            </TabsTrigger>
            <TabsTrigger value="overdue">Overdue ({overdueCount})</TabsTrigger>
            <TabsTrigger value="in_progress">
              In Progress ({items.filter((i) => i.status === "in_progress").length})
            </TabsTrigger>
            <TabsTrigger value="completed">
              Completed ({items.filter((i) => i.status === "completed").length})
            </TabsTrigger>
            <TabsTrigger value="skipped">
              Skipped ({items.filter((i) => i.status === "skipped").length})
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {isLoading ? (
          <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
            Loading maintenance tasks…
          </div>
        ) : (
          <TaskList
            items={filtered}
            onSelect={setSelected}
            emptyAction={<TaskCreateDialog onCreate={scheduleTask} />}
          />
        )}
      </div>
    </FeatureShell>
  )
}
