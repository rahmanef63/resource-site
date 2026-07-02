"use client"

import { Wallet } from "lucide-react"
import type { Id } from "@convex/_generated/dataModel"
import { ExternalDataSliceShell } from "@/frontend/shared/foundation/external-data"

interface QsrPettyCashPageProps {
  workspaceId?: Id<"workspaces"> | null
}

export default function QsrPettyCashPage({ workspaceId }: QsrPettyCashPageProps) {
  return (
    <ExternalDataSliceShell
      featureId="qsr-petty-cash"
      workspaceId={workspaceId}
      title="QSR Petty Cash"
      description="Daily petty cash log pulled from an external sheet, Drive export, or REST endpoint."
      icon={<Wallet className="mt-1 h-6 w-6 text-orange-600" />}
      defaultKind="sheets"
    />
  )
}
