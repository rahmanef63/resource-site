"use client"

import type { Id } from "@convex/_generated/dataModel"
import IntegrationsPage from "./views/IntegrationsPage"

export interface IntegrationsPageProps {
  workspaceId?: Id<"workspaces"> | null
}

export default function Page({ workspaceId }: IntegrationsPageProps) {
  return <IntegrationsPage workspaceId={workspaceId} />
}
