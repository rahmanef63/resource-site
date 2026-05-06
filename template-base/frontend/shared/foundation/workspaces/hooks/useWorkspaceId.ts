import { useWorkspaceContext } from "../../provider/WorkspaceProvider"
import type { Id } from "@convex/_generated/dataModel"

export function useWorkspaceId(): Id<"workspaces"> | null {
  const { workspaceId } = useWorkspaceContext()
  return workspaceId
}

export function useWorkspaceIds(): Id<"workspaces">[] {
  const { workspaces } = useWorkspaceContext()
  if (!workspaces) return []
  return workspaces.map((ws) => ws._id)
}
