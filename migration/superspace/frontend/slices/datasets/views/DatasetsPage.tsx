"use client"

import { Database } from "lucide-react"
import type { Id } from "@convex/_generated/dataModel"
import { FeatureShell } from "@/frontend/shared/ui/layout/feature-shell"
import { DatasetDirectory } from "@/frontend/shared/datasets"

interface DatasetsPageProps {
  workspaceId?: Id<"workspaces"> | null
}

export default function DatasetsPage({ workspaceId }: DatasetsPageProps) {
  if (!workspaceId) {
    return (
      <FeatureShell featureId="datasets" centered padding>
        <div className="text-center">
          <Database className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
          <h2 className="text-lg font-semibold">No Workspace Selected</h2>
        </div>
      </FeatureShell>
    )
  }

  return (
    <FeatureShell featureId="datasets" padding>
      <DatasetDirectory workspaceId={workspaceId} />
    </FeatureShell>
  )
}
