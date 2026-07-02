"use client"

import type { Id } from "@convex/_generated/dataModel"
import QsrDashboardPage from "./views/QsrDashboardPage"

export interface QsrDashboardPageProps {
  workspaceId?: Id<"workspaces"> | null
}

export default function Page({ workspaceId }: QsrDashboardPageProps) {
  return <QsrDashboardPage workspaceId={workspaceId} />
}
