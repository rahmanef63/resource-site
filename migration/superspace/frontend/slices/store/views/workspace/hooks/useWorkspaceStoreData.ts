"use client"

/**
 * Workspace Store Data Hook
 * 
 * Syncs Convex data with Zustand store
 */

import { useEffect, useMemo, useCallback } from "react"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { useWorkspaceStore } from "../store"
import type { WorkspaceStoreItem, WorkspaceFilters } from "../types"
import type { Doc } from "@/convex/_generated/dataModel"

type ConvexWorkspace = Doc<"workspaces"> & {
  color?: string
  icon?: string
  isMainWorkspace?: boolean
  isLinked?: boolean
  shareDataToParent?: boolean
  depth?: number
  path?: string[]
  sortOrder?: number
}

/**
 * Hook to sync workspace data from Convex to the store
 */
export function useWorkspaceStoreData() {
  const setWorkspaces = useWorkspaceStore((s) => s.setWorkspaces)
  const setLoading = useWorkspaceStore((s) => s.setLoading)
  const setError = useWorkspaceStore((s) => s.setError)
  
  // Fetch workspaces from Convex
  const workspacesQuery = useQuery(api.workspace.workspaces.getUserWorkspaces)
  const treeQuery = useQuery(api.workspace.hierarchy.getWorkspaceTree, { maxDepth: 6 })
  
  const isLoading = workspacesQuery === undefined
  
  // Transform Convex data to store format
  const workspaces = useMemo(() => {
    if (!workspacesQuery) return []
    
    return workspacesQuery.map((ws: ConvexWorkspace): WorkspaceStoreItem => ({
      _id: ws._id,
      id: String(ws._id),
      name: ws.name,
      slug: ws.slug,
      description: ws.description,
      type: ws.type as WorkspaceStoreItem["type"],
      // Icon is stored directly on workspace, not in settings
      icon: ws.icon,
      color: ws.color ?? "#6366f1",
      isPublic: ws.isPublic,
      isMainWorkspace: ws.isMainWorkspace,
      isLinked: ws.isLinked,
      shareDataToParent: ws.shareDataToParent ?? false,
      settings: ws.settings as WorkspaceStoreItem["settings"],
      createdBy: ws.createdBy,
      _creationTime: ws._creationTime,
      // Hierarchy fields
      parentId: ws.parentWorkspaceId ? String(ws.parentWorkspaceId) : null,
      depth: ws.depth ?? 0,
      path: (ws.path ?? []).map((id) => String(id)),
      sortOrder: ws.sortOrder ?? 0,
    }))
  }, [workspacesQuery])
  
  // Sync to store when data changes
  useEffect(() => {
    setLoading(isLoading)
    
    if (workspaces.length > 0) {
      setWorkspaces(workspaces)
    }
  }, [workspaces, isLoading, setWorkspaces, setLoading])
  
  // Refetch function (no-op since Convex auto-syncs)
  const refetch = useCallback(() => {
    // Convex auto-syncs, but we can force a re-render if needed
  }, [])
  
  return {
    isLoading,
    workspaces,
    tree: treeQuery,
    refetch,
  }
}

/**
 * Hook to get workspace tree structure
 */
export function useWorkspaceTree() {
  const tree = useWorkspaceStore((s) => s.tree)
  const flatItems = useWorkspaceStore((s) => s.flatItems)
  const expandedIds = useWorkspaceStore((s) => s.expandedIds)
  
  return {
    tree,
    flatItems,
    expandedIds,
  }
}

// Alias for consistency
export const useWorkspaceStoreTree = useWorkspaceTree

/**
 * Hook to get filtered workspaces based on search and filters
 */
export function useFilteredWorkspaces(filters?: WorkspaceFilters) {
  const workspacesMap = useWorkspaceStore((s) => s.workspaces)
  const searchQuery = useWorkspaceStore((s) => s.searchQuery)
  
  return useMemo(() => {
    const workspaces = Array.from(workspacesMap.values())
    const query = (filters?.search || searchQuery).toLowerCase().trim()
    
    let filtered = workspaces
    
    // Search filter
    if (query) {
      filtered = filtered.filter((item) =>
        item.name.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query)
      )
    }
    
    // Type filter
    if (filters?.types?.length) {
      filtered = filtered.filter((item) => filters.types!.includes(item.type))
    }
    
    // Has children filter
    if (filters?.hasChildren !== undefined) {
      if (filters.hasChildren) {
        const parentIds = new Set(workspaces.map((w) => w.parentId).filter(Boolean))
        filtered = filtered.filter((item) => parentIds.has(item.id))
      } else {
        const parentIds = new Set(workspaces.map((w) => w.parentId).filter(Boolean))
        filtered = filtered.filter((item) => !parentIds.has(item.id))
      }
    }
    
    // Hierarchy level filter
    if (filters?.hierarchyLevel !== undefined) {
      filtered = filtered.filter((item) => item.depth === filters.hierarchyLevel)
    }
    
    return filtered
  }, [workspacesMap, searchQuery, filters])
}

// Alias for consistency
export const useWorkspaceStoreFiltered = useFilteredWorkspaces

/**
 * Hook to get workspace by ID
 */
export function useWorkspaceById(id: string | null) {
  const workspaces = useWorkspaceStore((s) => s.workspaces)
  
  return useMemo(() => {
    if (!id) return null
    return workspaces.get(id) ?? null
  }, [workspaces, id])
}

// Alias for consistency
export const useWorkspaceStoreById = useWorkspaceById

/**
 * Hook to get workspace children
 */
export function useWorkspaceChildren(parentId: string | null) {
  const getChildren = useWorkspaceStore((s) => s.getChildren)
  
  return useMemo(() => {
    return getChildren(parentId)
  }, [getChildren, parentId])
}

/**
 * Hook to get workspace siblings
 */
export function useWorkspaceSiblings(id: string | null) {
  const getSiblings = useWorkspaceStore((s) => s.getSiblings)
  
  return useMemo(() => {
    if (!id) return []
    return getSiblings(id)
  }, [getSiblings, id])
}

/**
 * Hook to get workspace ancestors
 */
export function useWorkspaceAncestors(id: string | null) {
  const getAncestors = useWorkspaceStore((s) => s.getAncestors)
  
  return useMemo(() => {
    if (!id) return []
    return getAncestors(id)
  }, [getAncestors, id])
}
