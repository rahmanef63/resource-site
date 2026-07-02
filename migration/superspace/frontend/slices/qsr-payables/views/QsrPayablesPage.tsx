"use client"

import { Receipt } from "lucide-react"
import type { Id } from "@convex/_generated/dataModel"
import { ExternalDataSliceShell } from "@/frontend/shared/foundation/external-data"

interface QsrPayablesPageProps {
  workspaceId?: Id<"workspaces"> | null
}

export default function QsrPayablesPage({ workspaceId }: QsrPayablesPageProps) {
  return (
    <ExternalDataSliceShell
      featureId="qsr-payables"
      workspaceId={workspaceId}
      title="QSR Payables"
      description="Vendor invoice register from an external accounting export or REST feed."
      icon={<Receipt className="mt-1 h-6 w-6 text-orange-600" />}
      defaultKind="sheets"
    />
  )
}
