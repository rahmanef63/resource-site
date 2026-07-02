"use client"

import { MoreHorizontal, BedDouble } from "lucide-react"
import type { Id } from "@convex/_generated/dataModel"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "@/hooks/use-toast"
import {
  type BookingRow,
  type BookingStatus,
  useGuestBookings,
} from "../hooks/useGuestBookings"
import { VerifyBookingDialog } from "./VerifyBookingDialog"
import { useState } from "react"

interface BookingListProps {
  workspaceId: Id<"workspaces">
  statusFilter?: BookingStatus
}

const STATUS_VARIANT: Record<
  BookingStatus,
  "default" | "secondary" | "outline" | "destructive"
> = {
  pending: "secondary",
  verified: "default",
  "checked-in": "default",
  "checked-out": "outline",
  cancelled: "destructive",
}

export function BookingList({ workspaceId, statusFilter }: BookingListProps) {
  const { bookings, isLoading, cancelBooking, checkInBooking } = useGuestBookings(
    workspaceId,
    statusFilter,
  )
  const [verifyTarget, setVerifyTarget] = useState<BookingRow | null>(null)

  if (isLoading) {
    return <div className="text-sm text-muted-foreground">Loading bookings…</div>
  }

  if (bookings.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center gap-2 py-12 text-center">
          <BedDouble className="h-8 w-8 text-muted-foreground" />
          <p className="text-sm font-medium">No bookings here yet.</p>
          <p className="text-xs text-muted-foreground">
            Create a booking from the toolbar above.
          </p>
        </CardContent>
      </Card>
    )
  }

  const handleCancel = async (bookingId: Id<"bookings">) => {
    try {
      await cancelBooking({ workspaceId, bookingId, reason: "Cancelled via UI" })
      toast({ title: "Booking cancelled" })
    } catch (err) {
      toast({
        title: "Cancel failed",
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive",
      })
    }
  }

  const handleCheckIn = async (b: BookingRow) => {
    const room = b.roomNumber ?? window.prompt("Room number for check-in?") ?? ""
    if (!room.trim()) return
    try {
      await checkInBooking({ workspaceId, bookingId: b._id, roomNumber: room })
      toast({ title: `Checked in to room ${room}` })
    } catch (err) {
      toast({
        title: "Check-in failed",
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive",
      })
    }
  }

  return (
    <>
      <div className="grid gap-3">
        {bookings.map((b) => (
          <Card key={b._id}>
            <CardContent className="flex items-center justify-between gap-4 py-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-muted-foreground">
                    {b.bookingNumber}
                  </span>
                  <Badge variant={STATUS_VARIANT[b.status]}>{b.status}</Badge>
                  {b.syariahVerified ? (
                    <Badge variant="outline" className="text-xs">
                      syariah
                    </Badge>
                  ) : null}
                </div>
                <p className="mt-1 truncate text-sm font-medium">{b.guestName}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {b.checkInDate} → {b.checkOutDate}
                  {b.roomNumber ? ` · Room ${b.roomNumber}` : ""}
                </p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" aria-label="Booking actions">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {b.status === "pending" ? (
                    <DropdownMenuItem onClick={() => setVerifyTarget(b)}>
                      Verify…
                    </DropdownMenuItem>
                  ) : null}
                  {b.status === "verified" ? (
                    <DropdownMenuItem onClick={() => handleCheckIn(b)}>
                      Check in…
                    </DropdownMenuItem>
                  ) : null}
                  {b.status !== "cancelled" && b.status !== "checked-out" ? (
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => handleCancel(b._id)}
                    >
                      Cancel
                    </DropdownMenuItem>
                  ) : null}
                </DropdownMenuContent>
              </DropdownMenu>
            </CardContent>
          </Card>
        ))}
      </div>

      <VerifyBookingDialog
        workspaceId={workspaceId}
        booking={verifyTarget}
        open={verifyTarget !== null}
        onOpenChange={(o) => {
          if (!o) setVerifyTarget(null)
        }}
      />
    </>
  )
}
