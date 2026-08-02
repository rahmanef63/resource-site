"use client"

import type { Id } from "@convex/_generated/dataModel"
import TagsPage from "./views/TagsPage"

export interface TagsPageProps {
  workspaceId?: Id<"workspaces"> | null
}

export default function Page({ workspaceId }: TagsPageProps) {
  return <TagsPage workspaceId={workspaceId} />
}
