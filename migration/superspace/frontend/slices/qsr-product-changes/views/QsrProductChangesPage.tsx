"use client"

import { RefreshCcw } from "lucide-react"
import type { Id } from "@convex/_generated/dataModel"
import { ExternalDataSliceShell } from "@/frontend/shared/foundation/external-data"

interface QsrProductChangesPageProps {
  workspaceId?: Id<"workspaces"> | null
}

export default function QsrProductChangesPage({ workspaceId }: QsrProductChangesPageProps) {
  return (
    <ExternalDataSliceShell
      featureId="qsr-product-changes"
      workspaceId={workspaceId}
      title="QSR Product Changes"
      description="Menu / SKU change log from an external POS export, REST audit feed, or RSS notice list."
      icon={<RefreshCcw className="mt-1 h-6 w-6 text-orange-600" />}
      defaultKind="rss"
    />
  )
}
