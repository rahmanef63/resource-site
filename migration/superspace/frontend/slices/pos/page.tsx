"use client"

import type { Id } from "@convex/_generated/dataModel"
import PosPage from "./views/PosPage"

export interface PosPageProps {
  workspaceId?: Id<"workspaces"> | null
}

export default function Page({ workspaceId }: PosPageProps) {
  return <PosPage workspaceId={workspaceId} />
}
