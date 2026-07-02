"use client"

import type { Id } from "@convex/_generated/dataModel"
import BiPage from "./views/BiPage"

export interface BiPageProps {
  workspaceId?: Id<"workspaces"> | null
}

export default function Page({ workspaceId }: BiPageProps) {
  return <BiPage workspaceId={workspaceId} />
}
