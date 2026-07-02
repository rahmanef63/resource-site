"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Plus } from "lucide-react"
import type { Id } from "@convex/_generated/dataModel"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ResponsiveDialog } from "@/frontend/shared/ui/components/ResponsiveDialog"
import { DateField } from "@/frontend/shared/foundation/utils/datepicker/DateField"
import { toast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { useGuestBookings } from "../hooks/useGuestBookings"

const formSchema = z
  .object({
    guestName: z.string().min(1, "Required"),
    guestEmail: z.string().email("Invalid email"),
    guestPhone: z.string().optional(),
    checkInDate: z.string().min(1, "Required"),
    checkOutDate: z.string().min(1, "Required"),
    roomNumber: z.string().optional(),
    notes: z.string().optional(),
  })
  .refine((v) => v.checkOutDate > v.checkInDate, {
    path: ["checkOutDate"],
    message: "Check-out must be after check-in",
  })

type FormInput = z.infer<typeof formSchema>

interface Props {
  workspaceId: Id<"workspaces">
  trigger?: React.ReactNode
}

export function NewBookingDialog({ workspaceId, trigger }: Props) {
  const [open, setOpen] = useState(false)
  const { createBooking } = useGuestBookings(workspaceId)

  const today = new Date().toISOString().slice(0, 10)
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10)

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormInput>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      guestName: "",
      guestEmail: "",
      guestPhone: "",
      checkInDate: today,
      checkOutDate: tomorrow,
      roomNumber: "",
      notes: "",
    },
  })

  const onSubmit = handleSubmit(async (values) => {
    try {
      await createBooking({
        workspaceId,
        guestName: values.guestName,
        guestEmail: values.guestEmail,
        guestPhone: values.guestPhone || undefined,
        checkInDate: values.checkInDate,
        checkOutDate: values.checkOutDate,
        roomNumber: values.roomNumber || undefined,
        notes: values.notes || undefined,
      })
      toast({ title: "Booking created" })
      reset()
      setOpen(false)
    } catch (err) {
      toast({
        title: "Create failed",
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive",
      })
    }
  })

  return (
    <>
      {trigger ? (
        <span onClick={() => setOpen(true)}>{trigger}</span>
      ) : (
        <Button size="sm" className="gap-1.5" onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" />
          New booking
        </Button>
      )}

      <ResponsiveDialog open={open} onOpenChange={setOpen} variant="modal" size="md">
        <ResponsiveDialog.Header>
          <ResponsiveDialog.Title>New booking</ResponsiveDialog.Title>
          <ResponsiveDialog.Description>
            Create a pending booking. Verification happens next.
          </ResponsiveDialog.Description>
        </ResponsiveDialog.Header>

        <form onSubmit={onSubmit} className="flex min-h-0 flex-1 flex-col">
          <ResponsiveDialog.Body className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="guestName">Guest name</Label>
              <Input
                id="guestName"
                {...register("guestName")}
                className={cn(errors.guestName && "border-destructive")}
              />
              {errors.guestName ? (
                <p className="text-xs text-destructive">{errors.guestName.message}</p>
              ) : null}
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="guestEmail">Email</Label>
                <Input
                  id="guestEmail"
                  type="email"
                  {...register("guestEmail")}
                  className={cn(errors.guestEmail && "border-destructive")}
                />
                {errors.guestEmail ? (
                  <p className="text-xs text-destructive">{errors.guestEmail.message}</p>
                ) : null}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="guestPhone">Phone (optional)</Label>
                <Input id="guestPhone" {...register("guestPhone")} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label htmlFor="checkInDate">Check-in</Label>
                <DateField name="checkInDate" control={control} placeholder="Check-in" />
                {errors.checkInDate ? (
                  <p className="text-xs text-destructive">{errors.checkInDate.message}</p>
                ) : null}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="checkOutDate">Check-out</Label>
                <DateField name="checkOutDate" control={control} placeholder="Check-out" />
                {errors.checkOutDate ? (
                  <p className="text-xs text-destructive">{errors.checkOutDate.message}</p>
                ) : null}
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="roomNumber">Room number (optional)</Label>
              <Input id="roomNumber" {...register("roomNumber")} />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" rows={3} {...register("notes")} />
            </div>
          </ResponsiveDialog.Body>

          <ResponsiveDialog.Footer>
            <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={isSubmitting}>
              {isSubmitting ? "Creating…" : "Create booking"}
            </Button>
          </ResponsiveDialog.Footer>
        </form>
      </ResponsiveDialog>
    </>
  )
}
