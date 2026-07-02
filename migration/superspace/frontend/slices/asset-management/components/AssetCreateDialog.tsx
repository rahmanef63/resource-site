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
import { DateField } from "@/frontend/shared/foundation/utils/datepicker"
import { cn } from "@/lib/utils"
import {
  DEPRECIATION_METHODS,
  DEPRECIATION_METHOD_LABELS,
  registerAssetSchema,
  type DepreciationMethod,
  type RegisterAssetInput,
} from "../types"

interface AssetCreateDialogProps {
  trigger?: React.ReactNode
  onCreate: (input: RegisterAssetInput) => Promise<unknown>
}

export function AssetCreateDialog({ trigger, onCreate }: AssetCreateDialogProps) {
  const [open, setOpen] = useState(false)

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<RegisterAssetInput>({
    resolver: zodResolver(registerAssetSchema),
    defaultValues: {
      name: "",
      category: "",
      purchaseDate: new Date().toISOString().slice(0, 10),
      depreciationMethod: "straight-line",
    },
  })

  const depreciationMethod = watch("depreciationMethod")

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
          Register asset
        </Button>
      )}

      <ResponsiveDialog open={open} onOpenChange={setOpen} variant="modal" size="md">
        <ResponsiveDialog.Header>
          <ResponsiveDialog.Title>Register asset</ResponsiveDialog.Title>
          <ResponsiveDialog.Description>
            Add a new managed asset. A &quot;purchase&quot; transaction is recorded automatically when a price is provided.
          </ResponsiveDialog.Description>
        </ResponsiveDialog.Header>

        <form onSubmit={onSubmit} className="flex min-h-0 flex-1 flex-col">
          <ResponsiveDialog.Body className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="e.g., Espresso machine #2"
                {...register("name")}
                className={cn(errors.name && "border-destructive")}
              />
              {errors.name ? (
                <p className="text-xs text-destructive">{errors.name.message}</p>
              ) : null}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  placeholder="kitchen, hvac, computer, …"
                  {...register("category")}
                  className={cn(errors.category && "border-destructive")}
                />
                {errors.category ? (
                  <p className="text-xs text-destructive">{errors.category.message}</p>
                ) : null}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="serialNumber">Serial number</Label>
                <Input id="serialNumber" {...register("serialNumber")} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label htmlFor="purchaseDate">Purchase date</Label>
                <DateField name="purchaseDate" control={control} placeholder="Pick a date" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="purchasePrice">Purchase price (IDR)</Label>
                <Input
                  id="purchasePrice"
                  type="number"
                  step="1"
                  min={0}
                  {...register("purchasePrice")}
                  className={cn(errors.purchasePrice && "border-destructive")}
                />
                {errors.purchasePrice ? (
                  <p className="text-xs text-destructive">{errors.purchasePrice.message}</p>
                ) : null}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label htmlFor="depreciationMethod">Depreciation method</Label>
                <Select
                  value={depreciationMethod}
                  onValueChange={(v) =>
                    setValue("depreciationMethod", v as DepreciationMethod)
                  }
                >
                  <SelectTrigger id="depreciationMethod">
                    <SelectValue placeholder="Select method" />
                  </SelectTrigger>
                  <SelectContent>
                    {DEPRECIATION_METHODS.map((m) => (
                      <SelectItem key={m} value={m}>
                        {DEPRECIATION_METHOD_LABELS[m]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="usefulLifeYears">Useful life (years)</Label>
                <Input
                  id="usefulLifeYears"
                  type="number"
                  step="1"
                  min={1}
                  {...register("usefulLifeYears")}
                  className={cn(errors.usefulLifeYears && "border-destructive")}
                />
                {errors.usefulLifeYears ? (
                  <p className="text-xs text-destructive">{errors.usefulLifeYears.message}</p>
                ) : null}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  placeholder="e.g., Branch-A kitchen"
                  {...register("location")}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="branchId">Branch (optional)</Label>
                <Input id="branchId" {...register("branchId")} />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="assignedTo">Assigned to (user ID)</Label>
              <Input
                id="assignedTo"
                placeholder="users/..."
                {...register("assignedTo")}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" rows={3} {...register("notes")} />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="photos">Photos (one URL per line)</Label>
              <Textarea
                id="photos"
                rows={3}
                placeholder={"https://...\nhttps://..."}
                {...register("photos")}
                className={cn(errors.photos && "border-destructive")}
              />
              {errors.photos ? (
                <p className="text-xs text-destructive">
                  {errors.photos.message ?? "One or more URLs are invalid"}
                </p>
              ) : null}
            </div>
          </ResponsiveDialog.Body>

          <ResponsiveDialog.Footer>
            <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={isSubmitting}>
              {isSubmitting ? "Registering…" : "Register asset"}
            </Button>
          </ResponsiveDialog.Footer>
        </form>
      </ResponsiveDialog>
    </>
  )
}
