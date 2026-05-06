import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import type { Id } from "@convex/_generated/dataModel"

/**
 * Hook for Tags feature
 */
export function useTags(workspaceId: Id<"workspaces"> | null | undefined) {
  const tags = useQuery(
    api.features.tags.queries.getTags,
    workspaceId ? { workspaceId } : "skip"
  )

  const createTag = useMutation(api.features.tags.mutations.createTag)
  const updateTag = useMutation(api.features.tags.mutations.updateTag)
  const deleteTag = useMutation(api.features.tags.mutations.deleteTag)

  return {
    isLoading: tags === undefined && workspaceId !== null && workspaceId !== undefined,
    tags: tags ?? [],
    createTag,
    updateTag,
    deleteTag,
  }
}
