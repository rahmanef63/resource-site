import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import type { Id } from "@convex/_generated/dataModel"

/**
 * Hook for Search feature
 *
 * Pattern: Use Convex query directly, no manual loading state
 * The query returns undefined while loading, data when ready
 */
export function useSearch(workspaceId: Id<"workspaces"> | null | undefined) {
  // Query recent searches
  const recentSearches = useQuery(
    api.features.search.queries.getRecentSearches,
    workspaceId ? { workspaceId } : "skip"
  )

  // Query saved searches
  const savedSearches = useQuery(
    api.features.search.queries.getSavedSearches,
    workspaceId ? { workspaceId } : "skip"
  )

  // Mutations
  const performSearch = useMutation(api.features.search.mutations.search)
  const saveSearch = useMutation(api.features.search.mutations.saveSearch)
  const deleteSearch = useMutation(api.features.search.mutations.deleteSearch)

  return {
    // State
    isLoading: recentSearches === undefined && workspaceId !== null && workspaceId !== undefined,
    recentSearches,
    savedSearches,

    // Actions
    performSearch,
    saveSearch,
    deleteSearch,
  }
}

export function useGlobalSearch(query: string, workspaceId: Id<"workspaces"> | null | undefined) {
  const results = useQuery(
    api.features.search.queries.globalSearch,
    workspaceId && query.length >= 2 
      ? { workspaceId, query } 
      : "skip"
  )

  return {
    isLoading: results === undefined && !!workspaceId && query.length >= 2,
    results: results ?? [],
  }
}
