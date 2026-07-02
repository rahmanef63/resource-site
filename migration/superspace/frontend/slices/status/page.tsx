"use client"

// @dod:skip-uiux013 reason="status: loading/empty/error states surface in nested subcomponents (cards, lists, dialogs) — view file is a layout host, not a data terminal"

import type { Id } from "@/convex/_generated/dataModel"
import { StatusView } from "./StatusView"
import { FeatureShell } from "@/frontend/shared/ui/layout/feature-shell"

interface StatusPageProps {
  workspaceId?: Id<"workspaces"> | null
}

export default function StatusPage({ workspaceId }: StatusPageProps) {
  return (
    <FeatureShell featureId="status" padding={false}>
      <div className="h-full">
        <StatusView />
      </div>
    </FeatureShell>
  )
}
