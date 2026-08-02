"use client"

import type { Id } from "@convex/_generated/dataModel"
import { StarredView } from "./StarredView"

export default function StarredPage({
  workspaceId,
}: {
  workspaceId?: Id<"workspaces"> | null
}) {
  return <StarredView workspaceId={workspaceId} />
}
