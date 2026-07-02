"use client"

import { useMemo, useState } from "react"
import { BedDouble, CheckCircle2, ClipboardList, Hourglass } from "lucide-react"
import type { Id } from "@convex/_generated/dataModel"
import { FeatureShell, type ShellTabItem } from "@/frontend/shared/ui/layout/feature-shell"
import { BookingList } from "../components/BookingList"
import { NewBookingDialog } from "../components/NewBookingDialog"
import { useGuestBookings, type BookingStatus } from "../hooks/useGuestBookings"

interface GuestBookingViewProps {
  workspaceId: Id<"workspaces">
}

/**
 * GuestBookingView — main UI for the guest-booking slice.
 * Tabs: Pending / Verified / Checked-in / All. Each tab renders a
 * <BookingList> scoped to that status (or all). The header above the tabs
 * carries the `New booking` action.
 */
export function GuestBookingView({ workspaceId }: GuestBookingViewProps) {
  const [activeTab, setActiveTab] = useState<string>("pending")

  // Unfiltered list to drive tab badge counts. The list itself is small
  // (≤200 rows). Status-specific lists are independently fetched.
  const { bookings } = useGuestBookings(workspaceId)

  const counts = useMemo(() => {
    const c: Record<BookingStatus | "all", number> = {
      all: bookings.length,
      pending: 0,
      verified: 0,
      "checked-in": 0,
      "checked-out": 0,
      cancelled: 0,
    }
    for (const b of bookings) c[b.status] += 1
    return c
  }, [bookings])

  const tabs: ShellTabItem[] = [
    {
      value: "pending",
      label: "Pending",
      icon: Hourglass,
      badge: counts.pending,
      content: <BookingList workspaceId={workspaceId} statusFilter="pending" />,
    },
    {
      value: "verified",
      label: "Verified",
      icon: CheckCircle2,
      badge: counts.verified,
      content: <BookingList workspaceId={workspaceId} statusFilter="verified" />,
    },
    {
      value: "checked-in",
      label: "Checked-in",
      icon: BedDouble,
      badge: counts["checked-in"],
      content: <BookingList workspaceId={workspaceId} statusFilter="checked-in" />,
    },
    {
      value: "all",
      label: "All",
      icon: ClipboardList,
      badge: counts.all,
      content: <BookingList workspaceId={workspaceId} />,
    },
  ]

  const header = (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-lg font-semibold">Guest bookings</h1>
        <p className="text-xs text-muted-foreground">
          Hotel guest self-service lifecycle · Syariah-compliance verification.
        </p>
      </div>
      <NewBookingDialog workspaceId={workspaceId} />
    </div>
  )

  return (
    <FeatureShell
      featureId="guest-booking"
      padding
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >
      {header}
    </FeatureShell>
  )
}
