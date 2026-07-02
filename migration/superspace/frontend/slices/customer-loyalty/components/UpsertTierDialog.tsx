"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Crown, Pencil, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { ResponsiveDialog } from "@/frontend/shared/ui/components/ResponsiveDialog"
import { cn } from "@/lib/utils"
import { upsertTierSchema, type LoyaltyTier, type UpsertTierInput } from "../types"

type Mode = "create" | "edit"

interface UpsertTierDialogProps {
  trigger?: React.ReactNode
  mode?: Mode
  tier?: LoyaltyTier | null
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onSubmit: (input: UpsertTierInput) => Promise<unknown>
}

function benefitsToText(benefits?: string[]) {
  if (!benefits || benefits.length === 0) return ""
  return benefits.join("\n")
}

export function UpsertTierDialog({
  trigger,
  mode = "create",
  tier,
  open: controlledOpen,
  onOpenChange,
  onSubmit: onSubmitProp,
}: UpsertTierDialogProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false)
  const open = controlledOpen ?? uncontrolledOpen
  const setOpen = onOpenChange ?? setUncontrolledOpen

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<UpsertTierInput>({
    resolver: zodResolver(upsertTierSchema),
    defaultValues: {
      name: tier?.name ?? "",
      minPoints: tier?.minPoints ?? 0,
      pointsMultiplier: tier?.pointsMultiplier ?? 1,
      benefits: benefitsToText(tier?.benefits) as unknown as string[] | undefined,
      isActive: tier?.isActive ?? true,
    },
  })

  // When a different tier gets selected (edit mode flips in the parent) we
  // re-seed the form so prefill is always accurate.
  useEffect(() => {
    if (!open) return
    reset({
      name: tier?.name ?? "",
      minPoints: tier?.minPoints ?? 0,
      pointsMultiplier: tier?.pointsMultiplier ?? 1,
      benefits: benefitsToText(tier?.benefits) as unknown as string[] | undefined,
      isActive: tier?.isActive ?? true,
    })
  }, [open, tier, reset])

  const isActive = watch("isActive") ?? true

  const submit = handleSubmit(async (values) => {
    try {
      await onSubmitProp(values)
      setOpen(false)
    } catch {
      /* toast handled in hook */
    }
  })

  return (
    <>
      {trigger ? (
        <span onClick={() => setOpen(true)}>{trigger}</span>
      ) : mode === "create" ? (
        <Button size="sm" className="gap-1.5" onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" />
          New tier
        </Button>
      ) : null}

      <ResponsiveDialog open={open} onOpenChange={setOpen} variant="modal" size="md">
        <ResponsiveDialog.Header>
          <ResponsiveDialog.Title className="flex items-center gap-2">
            {mode === "edit" ? (
              <Pencil className="h-4 w-4 text-muted-foreground" />
            ) : (
              <Crown className="h-4 w-4 text-amber-600" />
            )}
            {mode === "edit" ? "Edit tier" : "New tier"}
          </ResponsiveDialog.Title>
          <ResponsiveDialog.Description>
            {mode === "edit"
              ? "Update the tier thresholds, multiplier, and benefits."
              : "Define a tier. Tiers are upserted by name — reusing a name updates the existing tier."}
          </ResponsiveDialog.Description>
        </ResponsiveDialog.Header>

        <form onSubmit={submit} className="flex min-h-0 flex-1 flex-col">
          <ResponsiveDialog.Body className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="tier-name">Tier name</Label>
              <Input
                id="tier-name"
                placeholder="gold"
                readOnly={mode === "edit"}
                {...register("name")}
                className={cn(errors.name && "border-destructive")}
              />
              {mode === "edit" ? (
                <p className="text-[11px] text-muted-foreground">
                  Tier name is the upsert key and cannot change. Create a new tier instead.
                </p>
              ) : null}
              {errors.name ? (
                <p className="text-xs text-destructive">{errors.name.message}</p>
              ) : null}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label htmlFor="minPoints">Minimum points</Label>
                <Input
                  id="minPoints"
                  type="number"
                  step="1"
                  min={0}
                  {...register("minPoints")}
                  className={cn(errors.minPoints && "border-destructive")}
                />
                {errors.minPoints ? (
                  <p className="text-xs text-destructive">{errors.minPoints.message}</p>
                ) : null}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="pointsMultiplier">Points multiplier</Label>
                <Input
                  id="pointsMultiplier"
                  type="number"
                  step="0.1"
                  min={0}
                  {...register("pointsMultiplier")}
                  className={cn(errors.pointsMultiplier && "border-destructive")}
                />
                {errors.pointsMultiplier ? (
                  <p className="text-xs text-destructive">
                    {errors.pointsMultiplier.message}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="benefits">Benefits</Label>
              <Textarea
                id="benefits"
                rows={4}
                placeholder={"One benefit per line, e.g.\n10% off merchandise\nFree shipping"}
                {...register("benefits")}
              />
              <p className="text-[11px] text-muted-foreground">
                Separate with new lines or commas. Leave empty for no listed benefits.
              </p>
            </div>

            <div className="flex items-center justify-between rounded-md border p-3">
              <div>
                <p className="text-sm font-medium">Tier active</p>
                <p className="text-xs text-muted-foreground">
                  Inactive tiers are hidden from new enrollments.
                </p>
              </div>
              <Switch
                checked={isActive}
                onCheckedChange={(v) => setValue("isActive", Boolean(v))}
                aria-label="Toggle tier active"
              />
            </div>
          </ResponsiveDialog.Body>

          <ResponsiveDialog.Footer>
            <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={isSubmitting}>
              {isSubmitting ? "Saving…" : mode === "edit" ? "Save changes" : "Create tier"}
            </Button>
          </ResponsiveDialog.Footer>
        </form>
      </ResponsiveDialog>
    </>
  )
}
