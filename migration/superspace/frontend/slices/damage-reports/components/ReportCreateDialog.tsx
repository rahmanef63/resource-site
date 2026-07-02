"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
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
import { cn } from "@/lib/utils"
import {
  SEVERITIES,
  SEVERITY_LABELS,
  createReportSchema,
  type CreateReportInput,
  type Severity,
} from "../types"

interface ReportCreateDialogProps {
  trigger?: React.ReactNode
  onCreate: (input: CreateReportInput) => Promise<unknown>
}

export function ReportCreateDialog({ trigger, onCreate }: ReportCreateDialogProps) {
  const [open, setOpen] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateReportInput>({
    resolver: zodResolver(createReportSchema),
    defaultValues: {
      category: "",
      severity: "medium",
      title: "",
      description: "",
    },
  })

  const severity = watch("severity")

  const onSubmit = handleSubmit(async (values) => {
    try {
      await onCreate(values)
      reset()
      setOpen(false)
    } catch {
      /* toast handled in hook */
    }
  })

  return (
    <>
      {trigger ? (
        <span onClick={() => setOpen(true)}>{trigger}</span>
      ) : (
        <Button size="sm" className="gap-1.5" onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" />
          New report
        </Button>
      )}

      <ResponsiveDialog open={open} onOpenChange={setOpen} variant="modal" size="md">
        <ResponsiveDialog.Header>
          <ResponsiveDialog.Title>File damage report</ResponsiveDialog.Title>
          <ResponsiveDialog.Description>
            Log an incident. Report lands in &quot;reported&quot; and awaits triage.
          </ResponsiveDialog.Description>
        </ResponsiveDialog.Header>

        <form onSubmit={onSubmit} className="flex min-h-0 flex-1 flex-col">
          <ResponsiveDialog.Body className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  placeholder="equipment, facility, room-fixture…"
                  {...register("category")}
                  className={cn(errors.category && "border-destructive")}
                />
                {errors.category ? (
                  <p className="text-xs text-destructive">{errors.category.message}</p>
                ) : null}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="severity">Severity</Label>
                <Select
                  value={severity}
                  onValueChange={(v) => setValue("severity", v as Severity)}
                >
                  <SelectTrigger id="severity">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SEVERITIES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {SEVERITY_LABELS[s]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="Short summary"
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
                placeholder="What happened, where, when…"
                {...register("description")}
                className={cn(errors.description && "border-destructive")}
              />
              {errors.description ? (
                <p className="text-xs text-destructive">{errors.description.message}</p>
              ) : null}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label htmlFor="location">Location</Label>
                <Input id="location" placeholder="Room 12 / Kitchen station B" {...register("location")} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="costEstimate">Cost estimate (IDR)</Label>
                <Input
                  id="costEstimate"
                  type="number"
                  step="1"
                  min={0}
                  {...register("costEstimate")}
                  className={cn(errors.costEstimate && "border-destructive")}
                />
                {errors.costEstimate ? (
                  <p className="text-xs text-destructive">{errors.costEstimate.message}</p>
                ) : null}
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="photos">Photos (one URL per line)</Label>
              <Textarea
                id="photos"
                rows={2}
                placeholder={"https://…\nhttps://…"}
                {...register("photos")}
                className={cn(errors.photos && "border-destructive")}
              />
              {errors.photos ? (
                <p className="text-xs text-destructive">{errors.photos.message as string}</p>
              ) : null}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label htmlFor="relatedEntityType">Related entity type</Label>
                <Input
                  id="relatedEntityType"
                  placeholder="asset | guest | order"
                  {...register("relatedEntityType")}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="relatedEntityId">Related entity ID</Label>
                <Input id="relatedEntityId" {...register("relatedEntityId")} />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="branchId">Branch (optional)</Label>
              <Input id="branchId" {...register("branchId")} />
            </div>
          </ResponsiveDialog.Body>

          <ResponsiveDialog.Footer>
            <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={isSubmitting}>
              {isSubmitting ? "Filing…" : "File report"}
            </Button>
          </ResponsiveDialog.Footer>
        </form>
      </ResponsiveDialog>
    </>
  )
}
