"use client"

import type { Id } from "@convex/_generated/dataModel"
import FormsPage from "./views/FormsPage"

export interface FormsPageProps {
  workspaceId?: Id<"workspaces"> | null
}

export default function Page({ workspaceId }: FormsPageProps) {
  return <FormsPage workspaceId={workspaceId} />
}
