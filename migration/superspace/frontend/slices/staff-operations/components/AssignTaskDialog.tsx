"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ResponsiveDialog } from "@/frontend/shared/ui/components/ResponsiveDialog"
import { cn } from "@/lib/utils"
import { toast } from "@/hooks/use-toast"
import type { Id } from "@convex/_generated/dataModel"
import {
  useStaffTaskMutations,
  type StaffTask,
} from "../hooks/useStaffTasks"

const formSchema = z.object({
  assignedToUserId: z.string().min(1, "Assignee user id required"),
})

type FormValues = z.infer<typeof formSchema>

interface Props {
  task: StaffTask | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

/**
 * Minimum-viable assignee picker. The full workspaceMembers picker can replace
 * the raw user-id input later; for now we accept a Convex user id directly so
 * the assign mutation pipeline is exercisable end-to-end.
 */
export function AssignTaskDialog({ task, open, onOpenChange }: Props) {
  const { assignTask } = useStaffTaskMutations()
  const [submitting, setSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { assignedToUserId: "" },
  })

  const onSubmit = handleSubmit(async (values) => {
    if (!task) return
    setSubmitting(true)
    try {
      await assignTask({
        workspaceId: task.workspaceId,
        taskId: task._id,
        assignedToUserId: values.assignedToUserId as Id<"users">,
      })
      toast({ title: "Task assigned", description: task.taskNumber })
      reset()
      onOpenChange(false)
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to assign task"
      toast({ title: "Assign failed", description: msg, variant: "destructive" })
    } finally {
      setSubmitting(false)
    }
  })

  return (
    <ResponsiveDialog open={open} onOpenChange={onOpenChange} variant="modal" size="sm">
      <ResponsiveDialog.Header>
        <ResponsiveDialog.Title>Assign task</ResponsiveDialog.Title>
        <ResponsiveDialog.Description>
          {task ? `${task.taskNumber} — ${task.title}` : "Assign to a workspace user."}
        </ResponsiveDialog.Description>
      </ResponsiveDialog.Header>

      <form onSubmit={onSubmit} className="flex min-h-0 flex-1 flex-col">
        <ResponsiveDialog.Body className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="assignedToUserId">Assignee user id</Label>
            <Input
              id="assignedToUserId"
              placeholder="users:abc123…"
              {...register("assignedToUserId")}
              className={cn(errors.assignedToUserId && "border-destructive")}
            />
            {errors.assignedToUserId ? (
              <p className="text-xs text-destructive">
                {errors.assignedToUserId.message}
              </p>
            ) : null}
            <p className="text-xs text-muted-foreground">
              Picker swap-in coming — paste a workspace member id for now.
            </p>
          </div>
        </ResponsiveDialog.Body>

        <ResponsiveDialog.Footer>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button type="submit" size="sm" disabled={submitting || !task}>
            {submitting ? "Assigning…" : "Assign"}
          </Button>
        </ResponsiveDialog.Footer>
      </form>
    </ResponsiveDialog>
  )
}
