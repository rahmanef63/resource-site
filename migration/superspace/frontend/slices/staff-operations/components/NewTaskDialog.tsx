"use client"

import { useState } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ResponsiveDialog } from "@/frontend/shared/ui/components/ResponsiveDialog"
import { DateField } from "@/frontend/shared/foundation/utils/datepicker"
import { cn } from "@/lib/utils"
import { toast } from "@/hooks/use-toast"
import type { Id } from "@convex/_generated/dataModel"
import {
  useStaffTaskMutations,
  type TaskCategory,
  type TaskPriority,
} from "../hooks/useStaffTasks"

const CATEGORIES: TaskCategory[] = [
  "housekeeping",
  "laundry",
  "damage-report",
  "maintenance",
  "other",
]

const PRIORITIES: TaskPriority[] = ["low", "medium", "high", "urgent"]

const CATEGORY_LABEL: Record<TaskCategory, string> = {
  housekeeping: "Housekeeping",
  laundry: "Laundry",
  "damage-report": "Damage Report",
  maintenance: "Maintenance",
  other: "Other",
}

const PRIORITY_LABEL: Record<TaskPriority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  urgent: "Urgent",
}

const formSchema = z.object({
  title: z.string().min(1, "Title required").max(200),
  description: z.string().max(2000).optional(),
  category: z.enum([
    "housekeeping",
    "laundry",
    "damage-report",
    "maintenance",
    "other",
  ]),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  locationLabel: z.string().max(120).optional(),
  dueDate: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

interface Props {
  workspaceId: Id<"workspaces">
  trigger?: React.ReactNode
}

export function NewTaskDialog({ workspaceId, trigger }: Props) {
  const [open, setOpen] = useState(false)
  const { createTask } = useStaffTaskMutations()

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "housekeeping",
      priority: "medium",
      locationLabel: "",
      dueDate: "",
    },
  })

  const onSubmit = handleSubmit(async (values) => {
    try {
      await createTask({
        workspaceId,
        title: values.title,
        description: values.description || undefined,
        category: values.category,
        priority: values.priority,
        locationLabel: values.locationLabel || undefined,
        dueDate: values.dueDate || undefined,
      })
      toast({ title: "Task created", description: `${values.title}` })
      reset()
      setOpen(false)
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to create task"
      toast({ title: "Create failed", description: msg, variant: "destructive" })
    }
  })

  return (
    <>
      {trigger ? (
        <span onClick={() => setOpen(true)}>{trigger}</span>
      ) : (
        <Button size="sm" className="gap-1.5" onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" />
          New task
        </Button>
      )}

      <ResponsiveDialog open={open} onOpenChange={setOpen} variant="modal" size="md">
        <ResponsiveDialog.Header>
          <ResponsiveDialog.Title>New staff task</ResponsiveDialog.Title>
          <ResponsiveDialog.Description>
            Log a housekeeping, laundry, damage report, or ad-hoc task.
          </ResponsiveDialog.Description>
        </ResponsiveDialog.Header>

        <form onSubmit={onSubmit} className="flex min-h-0 flex-1 flex-col">
          <ResponsiveDialog.Body className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="Clean room 203"
                {...register("title")}
                className={cn(errors.title && "border-destructive")}
              />
              {errors.title ? (
                <p className="text-xs text-destructive">{errors.title.message}</p>
              ) : null}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                rows={3}
                placeholder="Optional details — checklist items, context, notes…"
                {...register("description")}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label htmlFor="category">Category</Label>
                <Controller
                  control={control}
                  name="category"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="category">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map((c) => (
                          <SelectItem key={c} value={c}>
                            {CATEGORY_LABEL[c]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="priority">Priority</Label>
                <Controller
                  control={control}
                  name="priority"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="priority">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PRIORITIES.map((p) => (
                          <SelectItem key={p} value={p}>
                            {PRIORITY_LABEL[p]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label htmlFor="locationLabel">Location</Label>
                <Input
                  id="locationLabel"
                  placeholder="Room 203 / Floor 2 Laundry"
                  {...register("locationLabel")}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="dueDate">Due date</Label>
                <DateField
                  name="dueDate"
                  control={control}
                  placeholder="Pick due date"
                />
              </div>
            </div>
          </ResponsiveDialog.Body>

          <ResponsiveDialog.Footer>
            <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={isSubmitting}>
              {isSubmitting ? "Creating…" : "Create task"}
            </Button>
          </ResponsiveDialog.Footer>
        </form>
      </ResponsiveDialog>
    </>
  )
}
