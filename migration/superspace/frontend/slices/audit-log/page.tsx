"use client"

import type { Id } from "@convex/_generated/dataModel"
import AuditLogPage from "./views/AuditLogPage"

export interface AuditLogPageProps {
  workspaceId?: Id<"workspaces"> | null
}

export default function Page({ workspaceId }: AuditLogPageProps) {
  return <AuditLogPage workspaceId={workspaceId} />
}
