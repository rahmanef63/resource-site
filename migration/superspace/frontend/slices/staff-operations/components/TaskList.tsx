"use client"

import { useState } from "react"
import { CalendarDays, MapPin, User2, CheckCircle2, UserPlus2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { toast } from "@/hooks/use-toast"
import type { Id } from "@convex/_generated/dataModel"
import {
  useStaffTasks,
  useStaffTaskMutations,
  type StaffTask,
  type TaskCategory,
  type TaskPriority,
  type TaskStatus,
} from "../hooks/useStaffTasks"
import { AssignTaskDialog } from "./AssignTaskDialog"

const CATEGORY_LABEL: Record<TaskCategory, string> = {
  housekeeping: "Housekeeping",
  laundry: "Laundry",
  "damage-report": "Damage",
  maintenance: "Maintenance",
  other: "Other",
}

const PRIORITY_VARIANT: Record<TaskPriority, "secondary" | "outline" | "default" | "destructive"> = {
  low: "outline",
  medium: "secondary",
  high: "default",
  urgent: "destructive",
}

const STATUS_VARIANT: Record<TaskStatus, "secondary" | "outline" | "default" | "destructive"> = {
  open: "outline",
  assigned: "secondary",
  "in-progress": "default",
  completed: "secondary",
  cancelled: "destructive",
}

interface Props {
  workspaceId: Id<"workspaces">
  statusFilter?: TaskStatus
}

export function TaskList({ workspaceId, statusFilter }: Props) {
  const { tasks, isLoading } = useStaffTasks(workspaceId, { status: statusFilter })
  const { completeTask } = useStaffTaskMutations()
  const [assignTarget, setAssignTarget] = useState<StaffTask | null>(null)

  const onComplete = async (task: StaffTask) => {
    try {
      await completeTask({ workspaceId: task.workspaceId, taskId: task._id })
      toast({ title: "Task completed", description: task.taskNumber })
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to complete task"
      toast({ title: "Complete failed", description: msg, variant: "destructive" })
    }
  }

  if (isLoading) {
    return (
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="h-16 bg-muted/40" />
            <CardContent className="h-20 bg-muted/20" />
          </Card>
        ))}
      </div>
    )
  }

  if (tasks.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-10 text-center text-sm text-muted-foreground">
          No tasks{statusFilter ? ` with status “${statusFilter}”` : ""} yet.
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {tasks.map((task) => (
          <Card key={task._id}>
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-mono text-xs text-muted-foreground">
                    {task.taskNumber}
                  </p>
                  <h3 className="truncate text-sm font-semibold">{task.title}</h3>
                </div>
                <Badge variant={STATUS_VARIANT[task.status]} className="shrink-0 text-[10px]">
                  {task.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 pt-0">
              <div className="flex flex-wrap gap-1.5">
                <Badge variant="outline" className="text-[10px]">
                  {CATEGORY_LABEL[task.category]}
                </Badge>
                <Badge
                  variant={PRIORITY_VARIANT[task.priority]}
                  className="text-[10px]"
                >
                  {task.priority}
                </Badge>
              </div>
              {task.description ? (
                <p className="line-clamp-2 text-xs text-muted-foreground">
                  {task.description}
                </p>
              ) : null}
              <div className="space-y-1 text-xs text-muted-foreground">
                {task.locationLabel ? (
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-3 w-3" />
                    <span className="truncate">{task.locationLabel}</span>
                  </div>
                ) : null}
                {task.dueDate ? (
                  <div className="flex items-center gap-1.5">
                    <CalendarDays className="h-3 w-3" />
                    <span>{task.dueDate}</span>
                  </div>
                ) : null}
                {task.assignedToUserId ? (
                  <div className="flex items-center gap-1.5">
                    <User2 className="h-3 w-3" />
                    <span className="truncate font-mono">
                      {String(task.assignedToUserId).slice(0, 12)}…
                    </span>
                  </div>
                ) : null}
              </div>

              {task.status !== "completed" && task.status !== "cancelled" ? (
                <div className="flex gap-2 pt-1">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="h-7 gap-1 text-xs"
                    onClick={() => setAssignTarget(task)}
                  >
                    <UserPlus2 className="h-3 w-3" />
                    Assign
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    className="h-7 gap-1 text-xs"
                    onClick={() => onComplete(task)}
                  >
                    <CheckCircle2 className="h-3 w-3" />
                    Complete
                  </Button>
                </div>
              ) : null}
            </CardContent>
          </Card>
        ))}
      </div>

      <AssignTaskDialog
        task={assignTarget}
        open={assignTarget !== null}
        onOpenChange={(o) => {
          if (!o) setAssignTarget(null)
        }}
      />
    </>
  )
}
