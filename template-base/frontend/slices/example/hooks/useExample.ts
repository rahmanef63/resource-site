"use client"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import type { Id } from "@convex/_generated/dataModel"

/**
 * Example hook — demonstrates the standard SuperSpace hook pattern.
 *
 * Pattern:
 * 1. useQuery with "skip" guard for conditional fetching
 * 2. useMutation for write operations
 * 3. Return isLoading, data, and actions
 */
export function useExample(workspaceId: Id<"workspaces"> | null | undefined) {
  const items = useQuery(
    api.features.example.queries.getItems,
    workspaceId ? { workspaceId } : "skip"
  )

  const createItem = useMutation(api.features.example.mutations.createItem)
  const updateItem = useMutation(api.features.example.mutations.updateItem)
  const deleteItem = useMutation(api.features.example.mutations.deleteItem)

  return {
    isLoading: items === undefined && !!workspaceId,
    items: items ?? [],
    createItem,
    updateItem,
    deleteItem,
  }
}
