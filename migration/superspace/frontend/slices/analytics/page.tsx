"use client"

import type { Id } from "@convex/_generated/dataModel"
import AnalyticsPage from "./views/AnalyticsPage"

export interface AnalyticsPageProps {
  workspaceId?: Id<"workspaces"> | null
}

export default function Page({ workspaceId }: AnalyticsPageProps) {
  return <AnalyticsPage workspaceId={workspaceId} />
}
