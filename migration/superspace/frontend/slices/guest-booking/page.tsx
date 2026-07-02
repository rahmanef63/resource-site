"use client"

/**
 * Guest Booking — page entry point.
 * Resolves the active workspace from context, then defers to GuestBookingView.
 */
import { useWorkspaceContext } from "@/frontend/shared/foundation/provider/WorkspaceProvider"
import { FeatureShell } from "@/frontend/shared/ui/layout/feature-shell"
import { BedDouble } from "lucide-react"
import { GuestBookingView } from "./views/GuestBookingView"

export default function GuestBookingPage() {
  const { workspaceId } = useWorkspaceContext()

  if (!workspaceId) {
    return (
      <FeatureShell featureId="guest-booking" padding centered>
        <div className="text-center">
          <BedDouble className="mx-auto h-10 w-10 text-muted-foreground" />
          <h2 className="mt-4 text-lg font-semibold">No workspace selected</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Pick a workspace to manage guest bookings.
          </p>
        </div>
      </FeatureShell>
    )
  }

  return <GuestBookingView workspaceId={workspaceId} />
}
