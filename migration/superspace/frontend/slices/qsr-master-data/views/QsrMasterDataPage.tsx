"use client"

import { Boxes } from "lucide-react"
import type { Id } from "@convex/_generated/dataModel"
import { ExternalDataSliceShell } from "@/frontend/shared/foundation/external-data"

interface QsrMasterDataPageProps {
  workspaceId?: Id<"workspaces"> | null
}

export default function QsrMasterDataPage({ workspaceId }: QsrMasterDataPageProps) {
  return (
    <ExternalDataSliceShell
      featureId="qsr-master-data"
      workspaceId={workspaceId}
      title="QSR Master Data"
      description="Vendor & product reference — pulled from a Google Sheet or REST catalog endpoint."
      icon={<Boxes className="mt-1 h-6 w-6 text-orange-600" />}
      defaultKind="sheets"
    />
  )
}
