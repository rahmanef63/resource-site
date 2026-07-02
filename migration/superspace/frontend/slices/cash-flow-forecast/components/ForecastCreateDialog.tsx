"use client"

import { useEffect, useState } from "react"
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
import { DateField } from "@/frontend/shared/foundation/utils/datepicker"
import { cn } from "@/lib/utils"
import {
  GENERATION_SOURCES,
  GENERATION_SOURCE_LABELS,
  createForecastSchema,
  type CreateForecastInput,
  type GenerationSource,
} from "../types"

function computeEndDate(startDate: string, horizonDays: number): string {
  if (!startDate) return ""
  const d = new Date(startDate)
  if (Number.isNaN(d.getTime())) return ""
  d.setDate(d.getDate() + Math.max(0, horizonDays))
  return d.toISOString().slice(0, 10)
}

interface Props {
  trigger?: React.ReactNode
  onCreate: (input: CreateForecastInput) => Promise<unknown>
}

export function ForecastCreateDialog({ trigger, onCreate }: Props) {
  const [open, setOpen] = useState(false)

  const today = new Date().toISOString().slice(0, 10)

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateForecastInput>({
    resolver: zodResolver(createForecastSchema),
    defaultValues: {
      horizonDays: 30,
      startDate: today,
      endDate: computeEndDate(today, 30),
      baseCash: 0,
      generationSource: "manual",
      aiNotes: "",
    },
  })

  const generationSource = watch("generationSource")
  const horizonDays = watch("horizonDays")
  const startDate = watch("startDate")

  // Auto-recompute endDate whenever startDate or horizonDays change.
  useEffect(() => {
    const h = Number(horizonDays) || 0
    if (!startDate || h <= 0) return
    setValue("endDate", computeEndDate(startDate, h), { shouldDirty: true })
  }, [startDate, horizonDays, setValue])

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
          New forecast
        </Button>
      )}

      <ResponsiveDialog open={open} onOpenChange={setOpen} variant="modal" size="md">
        <ResponsiveDialog.Header>
          <ResponsiveDialog.Title>New cash-flow forecast</ResponsiveDialog.Title>
          <ResponsiveDialog.Description>
            Start a draft — add bucketed line items afterwards to project inflow / outflow.
          </ResponsiveDialog.Description>
        </ResponsiveDialog.Header>

        <form onSubmit={onSubmit} className="flex min-h-0 flex-1 flex-col">
          <ResponsiveDialog.Body className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label htmlFor="horizonDays">Horizon (days)</Label>
                <Input
                  id="horizonDays"
                  type="number"
                  min={1}
                  step="1"
                  {...register("horizonDays")}
                  className={cn(errors.horizonDays && "border-destructive")}
                />
                {errors.horizonDays ? (
                  <p className="text-xs text-destructive">{errors.horizonDays.message}</p>
                ) : null}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="baseCash">Base cash (IDR)</Label>
                <Input
                  id="baseCash"
                  type="number"
                  step="1"
                  {...register("baseCash")}
                  className={cn(errors.baseCash && "border-destructive")}
                />
                {errors.baseCash ? (
                  <p className="text-xs text-destructive">{errors.baseCash.message}</p>
                ) : null}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label htmlFor="startDate">Start date</Label>
                <DateField
                  name="startDate"
                  control={control}
                  placeholder="Start date"
                  className={cn(errors.startDate && "border-destructive")}
                />
                {errors.startDate ? (
                  <p className="text-xs text-destructive">{errors.startDate.message}</p>
                ) : null}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="endDate">End date</Label>
                <DateField
                  name="endDate"
                  control={control}
                  placeholder="End date"
                  className={cn(errors.endDate && "border-destructive")}
                />
                {errors.endDate ? (
                  <p className="text-xs text-destructive">{errors.endDate.message}</p>
                ) : null}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label htmlFor="generationSource">Source</Label>
                <Select
                  value={generationSource ?? "manual"}
                  onValueChange={(v) => setValue("generationSource", v as GenerationSource)}
                >
                  <SelectTrigger id="generationSource">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {GENERATION_SOURCES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {GENERATION_SOURCE_LABELS[s]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="branchId">Branch (optional)</Label>
                <Input id="branchId" {...register("branchId")} />
              </div>
            </div>

            {generationSource === "ai-assisted" ? (
              <div className="grid gap-2">
                <Label htmlFor="aiNotes">AI notes</Label>
                <Textarea
                  id="aiNotes"
                  rows={3}
                  placeholder="Prompt, context, or assumptions the AI used…"
                  {...register("aiNotes")}
                />
              </div>
            ) : null}
          </ResponsiveDialog.Body>

          <ResponsiveDialog.Footer>
            <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={isSubmitting}>
              {isSubmitting ? "Creating…" : "Create forecast"}
            </Button>
          </ResponsiveDialog.Footer>
        </form>
      </ResponsiveDialog>
    </>
  )
}
