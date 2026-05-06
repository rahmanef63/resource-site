"use client"

import type { Id } from "@convex/_generated/dataModel"
import SearchPage from "./views/SearchPage"

export interface SearchPageProps {
  workspaceId?: Id<"workspaces"> | null
}

export default function Page({ workspaceId }: SearchPageProps) {
  return <SearchPage workspaceId={workspaceId} />
}
