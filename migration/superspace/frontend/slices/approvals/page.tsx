"use client"

import type { Id } from "@convex/_generated/dataModel"
import ApprovalsPage from "./views/ApprovalsPage"

export interface ApprovalsPageProps {
  workspaceId?: Id<"workspaces"> | null
}

export default function Page({ workspaceId }: ApprovalsPageProps) {
  return <ApprovalsPage workspaceId={workspaceId} />
}
