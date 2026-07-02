"use client"

import { HandCoins } from "lucide-react"
import type { Id } from "@convex/_generated/dataModel"
import { ExternalDataSliceShell } from "@/frontend/shared/foundation/external-data"

interface QsrAllowancesPageProps {
  workspaceId?: Id<"workspaces"> | null
}

export default function QsrAllowancesPage({ workspaceId }: QsrAllowancesPageProps) {
  return (
    <ExternalDataSliceShell
      featureId="qsr-allowances"
      workspaceId={workspaceId}
      title="QSR Allowances"
      description="Staff allowances ledger — sourced from an external HR sheet or REST endpoint."
      icon={<HandCoins className="mt-1 h-6 w-6 text-orange-600" />}
      defaultKind="sheets"
    />
  )
}
