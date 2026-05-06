/**
 * Tree Store Utilities
 * 
 * Reusable tree structure utilities for hierarchical data management
 */

import type {
  TreeNode,
  FlatTreeItem,
  TreeState,
  HierarchicalStoreItem,
  DnDResult,
} from "./types"

// ============================================================================
// Tree Building Utilities
// ============================================================================

/**
 * Build a tree structure from a flat list of items
 */
export function buildTree<T extends HierarchicalStoreItem>(
  items: T[],
  rootParentId: string | null = null
): TreeNode<T>[] {
  const itemMap = new Map<string, T>()
  const childrenMap = new Map<string | null, T[]>()

  // First pass: index items
  for (const item of items) {
    itemMap.set(item.id, item)
    
    const parentId = item.parentId
    if (!childrenMap.has(parentId)) {
      childrenMap.set(parentId, [])
    }
    childrenMap.get(parentId)!.push(item)
  }

  // Sort children by sortOrder
  for (const children of childrenMap.values()) {
    children.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
  }

  // Build tree recursively
  function buildNode(item: T, depth: number): TreeNode<T> {
    const children = childrenMap.get(item.id) ?? []
    return {
      id: item.id,
      parentId: item.parentId,
      depth,
      sortOrder: item.sortOrder ?? 0,
      data: item,
      children: children.map((child) => buildNode(child, depth + 1)),
    }
  }

  const rootItems = childrenMap.get(rootParentId) ?? []
  return rootItems.map((item) => buildNode(item, 0))
}

/**
 * Flatten a tree to a list (for virtual scrolling and DnD)
 */
export function flattenTree<T extends HierarchicalStoreItem>(
  tree: TreeNode<T>[],
  expandedIds: Set<string>,
  result: FlatTreeItem<T>[] = []
): FlatTreeItem<T>[] {
  for (const node of tree) {
    const isExpanded = expandedIds.has(node.id)
    const isLeaf = node.children.length === 0

    result.push({
      id: node.id,
      parentId: node.parentId,
      depth: node.depth,
      sortOrder: node.sortOrder,
      isExpanded,
      isLeaf,
      data: node.data,
    })

    if (isExpanded && !isLeaf) {
      flattenTree(node.children, expandedIds, result)
    }
  }

  return result
}

/**
 * Get all ancestor IDs of an item
 */
export function getAncestorIds<T extends HierarchicalStoreItem>(
  itemId: string,
  items: Map<string, T>
): string[] {
  const ancestors: string[] = []
  let currentId: string | null = items.get(itemId)?.parentId ?? null

  while (currentId) {
    ancestors.push(currentId)
    currentId = items.get(currentId)?.parentId ?? null
  }

  return ancestors
}

/**
 * Get all descendant IDs of an item
 */
export function getDescendantIds<T extends HierarchicalStoreItem>(
  itemId: string,
  items: Map<string, T>
): string[] {
  const descendants: string[] = []
  const stack = [itemId]

  while (stack.length > 0) {
    const currentId = stack.pop()!
    for (const [id, item] of items) {
      if (item.parentId === currentId) {
        descendants.push(id)
        stack.push(id)
      }
    }
  }

  return descendants
}

/**
 * Check if moving an item would create a cycle
 */
export function wouldCreateCycle<T extends HierarchicalStoreItem>(
  itemId: string,
  newParentId: string | null,
  items: Map<string, T>
): boolean {
  if (newParentId === null) return false
  if (itemId === newParentId) return true

  // Check if newParentId is a descendant of itemId
  const descendants = getDescendantIds(itemId, items)
  return descendants.includes(newParentId)
}

/**
 * Calculate new path for an item after move
 */
export function calculateNewPath<T extends HierarchicalStoreItem>(
  newParentId: string | null,
  items: Map<string, T>
): string[] {
  if (newParentId === null) return []

  const parent = items.get(newParentId)
  if (!parent) return []

  return [...parent.path, newParentId]
}

/**
 * Calculate new depth for an item after move
 */
export function calculateNewDepth<T extends HierarchicalStoreItem>(
  newParentId: string | null,
  items: Map<string, T>
): number {
  if (newParentId === null) return 0

  const parent = items.get(newParentId)
  if (!parent) return 0

  return parent.depth + 1
}

// ============================================================================
// DnD Utilities
// ============================================================================

/**
 * Calculate new sort order based on drop position
 */
export function calculateSortOrder(
  siblings: { id: string; sortOrder: number }[],
  targetId: string,
  position: "before" | "after" | "inside"
): number {
  if (position === "inside") {
    // Becomes first child - return 0 or max+1 based on preference
    return 0
  }

  const targetIndex = siblings.findIndex((s) => s.id === targetId)
  if (targetIndex === -1) return siblings.length

  if (position === "before") {
    if (targetIndex === 0) {
      return siblings[0].sortOrder - 1
    }
    const prev = siblings[targetIndex - 1].sortOrder
    const curr = siblings[targetIndex].sortOrder
    return (prev + curr) / 2
  } else {
    // after
    if (targetIndex === siblings.length - 1) {
      return siblings[targetIndex].sortOrder + 1
    }
    const curr = siblings[targetIndex].sortOrder
    const next = siblings[targetIndex + 1].sortOrder
    return (curr + next) / 2
  }
}

/**
 * Normalize sort orders to integers (call periodically to prevent floating point issues)
 */
export function normalizeSortOrders<T extends { id: string; sortOrder: number }>(
  items: T[]
): Map<string, number> {
  const sorted = [...items].sort((a, b) => a.sortOrder - b.sortOrder)
  const result = new Map<string, number>()
  
  sorted.forEach((item, index) => {
    result.set(item.id, index * 10) // Use increments of 10 for easy insertion
  })
  
  return result
}

// ============================================================================
// Tree State Utilities
// ============================================================================

/**
 * Create initial tree state
 */
export function createInitialTreeState(
  defaultExpanded: "all" | "none" | "first-level" = "first-level",
  rootIds: string[] = []
): TreeState {
  const expandedIds = new Set<string>()
  
  if (defaultExpanded === "all") {
    // Will be populated when items are loaded
  } else if (defaultExpanded === "first-level") {
    rootIds.forEach((id) => expandedIds.add(id))
  }
  
  return {
    expandedIds,
    selectedIds: new Set(),
    focusedId: null,
  }
}

/**
 * Toggle expansion state
 */
export function toggleExpanded(state: TreeState, id: string): TreeState {
  const newExpanded = new Set(state.expandedIds)
  if (newExpanded.has(id)) {
    newExpanded.delete(id)
  } else {
    newExpanded.add(id)
  }
  return { ...state, expandedIds: newExpanded }
}

/**
 * Toggle selection state (for multi-select)
 */
export function toggleSelected(state: TreeState, id: string, multiSelect = false): TreeState {
  const newSelected = multiSelect ? new Set(state.selectedIds) : new Set<string>()
  
  if (newSelected.has(id)) {
    newSelected.delete(id)
  } else {
    newSelected.add(id)
  }
  
  return { ...state, selectedIds: newSelected }
}

// ============================================================================
// Search/Filter Utilities
// ============================================================================

/**
 * Filter tree items by search query
 */
export function filterTreeItems<T extends HierarchicalStoreItem>(
  items: T[],
  query: string,
  searchFields: (keyof T)[] = ["name" as keyof T]
): T[] {
  if (!query.trim()) return items

  const lowerQuery = query.toLowerCase()
  const matchingIds = new Set<string>()

  // Find matching items
  for (const item of items) {
    const matches = searchFields.some((field) => {
      const value = item[field]
      if (typeof value === "string") {
        return value.toLowerCase().includes(lowerQuery)
      }
      return false
    })
    
    if (matches) {
      matchingIds.add(item.id)
      // Also include all ancestors (so the path to matching items is visible)
      for (const ancestorId of item.path) {
        matchingIds.add(ancestorId)
      }
    }
  }

  return items.filter((item) => matchingIds.has(item.id))
}

/**
 * Get IDs that should be auto-expanded to show search results
 */
export function getExpandedIdsForSearch<T extends HierarchicalStoreItem>(
  items: T[],
  query: string,
  searchFields: (keyof T)[] = ["name" as keyof T]
): Set<string> {
  if (!query.trim()) return new Set()

  const lowerQuery = query.toLowerCase()
  const expandedIds = new Set<string>()

  for (const item of items) {
    const matches = searchFields.some((field) => {
      const value = item[field]
      if (typeof value === "string") {
        return value.toLowerCase().includes(lowerQuery)
      }
      return false
    })

    if (matches) {
      // Expand all ancestors
      for (const ancestorId of item.path) {
        expandedIds.add(ancestorId)
      }
    }
  }

  return expandedIds
}
