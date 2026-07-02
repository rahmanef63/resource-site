"use client"

import { Utensils } from "lucide-react"
import type { Id } from "@convex/_generated/dataModel"
import { ExternalDataSliceShell } from "@/frontend/shared/foundation/external-data"

interface QsrDashboardPageProps {
  workspaceId?: Id<"workspaces"> | null
}

/**
 * QSR dashboard — external data reader. Owners point this slice at a
 * Looker/Metabase/Sheets dashboard URL (or any other external source);
 * the shell handles config + rendering. Replaces the previous
 * Convex-internal pipeline UI (2026-05-18).
 */
export default function QsrDashboardPage({ workspaceId }: QsrDashboardPageProps) {
  return (
    <ExternalDataSliceShell
      featureId="qsr-dashboard"
      workspaceId={workspaceId}
      title="QSR Dashboard"
      description="External weekly restaurant snapshot — point at a public dashboard URL or POS export."
      icon={<Utensils className="mt-1 h-6 w-6 text-orange-600" />}
      defaultKind="iframe"
    />
  )
}
