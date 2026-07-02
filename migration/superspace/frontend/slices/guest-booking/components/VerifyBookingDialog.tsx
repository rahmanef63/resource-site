"use client"

import { useEffect, useState } from "react"
import type { Id } from "@convex/_generated/dataModel"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ResponsiveDialog } from "@/frontend/shared/ui/components/ResponsiveDialog"
import { toast } from "@/hooks/use-toast"
import { type BookingRow, useGuestBookings } from "../hooks/useGuestBookings"

interface Props {
  workspaceId: Id<"workspaces">
  booking: BookingRow | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function VerifyBookingDialog({ workspaceId, booking, open, onOpenChange }: Props) {
  const { verifyBooking } = useGuestBookings(workspaceId)
  const [mahram, setMahram] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!open) {
      setMahram("")
      setIsSubmitting(false)
    }
  }, [open])

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!booking) return
    setIsSubmitting(true)
    try {
      await verifyBooking({
        workspaceId,
        bookingId: booking._id,
        mahramRelation: mahram.trim() || undefined,
      })
      toast({ title: "Booking verified" })
      onOpenChange(false)
    } catch (err) {
      toast({
        title: "Verify failed",
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <ResponsiveDialog open={open} onOpenChange={onOpenChange} variant="modal" size="sm">
      <ResponsiveDialog.Header>
        <ResponsiveDialog.Title>Verify booking</ResponsiveDialog.Title>
        <ResponsiveDialog.Description>
          Confirms Syariah-compliance. Sets status → verified.
        </ResponsiveDialog.Description>
      </ResponsiveDialog.Header>

      <form onSubmit={onSubmit} className="flex min-h-0 flex-1 flex-col">
        <ResponsiveDialog.Body className="space-y-4">
          {booking ? (
            <div className="rounded-md border p-3 text-xs">
              <p className="font-mono text-muted-foreground">{booking.bookingNumber}</p>
              <p className="mt-1 font-medium">{booking.guestName}</p>
              <p className="text-muted-foreground">
                {booking.checkInDate} → {booking.checkOutDate}
              </p>
            </div>
          ) : null}

          <div className="grid gap-2">
            <Label htmlFor="mahramRelation">Mahram relation (optional)</Label>
            <Input
              id="mahramRelation"
              placeholder="spouse, father, mother, n/a"
              value={mahram}
              onChange={(e) => setMahram(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Used for mahram verification on mixed-gender bookings.
            </p>
          </div>
        </ResponsiveDialog.Body>

        <ResponsiveDialog.Footer>
          <Button type="button" variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" size="sm" disabled={isSubmitting || !booking}>
            {isSubmitting ? "Verifying…" : "Verify"}
          </Button>
        </ResponsiveDialog.Footer>
      </form>
    </ResponsiveDialog>
  )
}
