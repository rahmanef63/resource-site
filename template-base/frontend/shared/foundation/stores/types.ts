/**
 * Shared Store Types
 * 
 * Common types for tree structures, DnD, and feature stores
 */

import type { LucideIcon } from "lucide-react"

// ============================================================================
// Tree Structure Types
// ============================================================================

/**
 * Base tree node interface - all tree structures should extend this
 */
export interface TreeNode<T = unknown> {
  id: string
  parentId: string | null
  children: TreeNode<T>[]
  depth: number
  sortOrder: number
  data: T
}

/**
 * Flattened tree item for virtual lists and DnD
 */
export interface FlatTreeItem<T = unknown> {
  id: string
  parentId: string | null
  depth: number
  sortOrder: number
  isExpanded: boolean
  isLeaf: boolean
  data: T
}

/**
 * Tree state for managing expansion, selection, etc.
 */
export interface TreeState {
  expandedIds: Set<string>
  selectedIds: Set<string>
  focusedId: string | null
}

// ============================================================================
// Drag and Drop Types
// ============================================================================

/**
 * DnD item being dragged
 */
export interface DragItem {
  id: string
  type: string
  parentId: string | null
  depth: number
  data?: unknown
}

/**
 * Drop position relative to target
 */
export type DropPosition = "before" | "after" | "inside"

/**
 * DnD state
 */
export interface DnDState {
  isDragging: boolean
  draggedId: string | null
  draggedType: string | null
  overId: string | null
  dropPosition: DropPosition | null
}

/**
 * DnD result after drop
 */
export interface DnDResult {
  itemId: string
  fromParentId: string | null
  toParentId: string | null
  newSortOrder: number
  position: DropPosition
}

// ============================================================================
// Feature Store Base Types
// ============================================================================

/**
 * Base store item with common fields
 */
export interface BaseStoreItem {
  id: string
  name: string
  slug?: string
  description?: string
  icon?: string
  color?: string
  isActive?: boolean
  createdAt?: number
  updatedAt?: number
}

/**
 * Hierarchical store item
 */
export interface HierarchicalStoreItem extends BaseStoreItem {
  parentId: string | null
  depth: number
  path: string[]
  sortOrder: number
  children?: HierarchicalStoreItem[]
}

/**
 * Icon picker item
 */
export interface IconItem {
  name: string
  component: LucideIcon
  category: string
  keywords: string[]
}

/**
 * Color picker item
 */
export interface ColorItem {
  name: string
  value: string
  category: string
}

// ============================================================================
// Store Action Types
// ============================================================================

/**
 * Common CRUD actions for stores
 */
export interface CRUDActions<T> {
  create: (item: Partial<T>) => Promise<string>
  update: (id: string, updates: Partial<T>) => Promise<void>
  delete: (id: string) => Promise<void>
  get: (id: string) => T | undefined
  getAll: () => T[]
}

/**
 * Tree manipulation actions
 */
export interface TreeActions<T extends HierarchicalStoreItem> {
  moveItem: (itemId: string, newParentId: string | null, newSortOrder: number) => Promise<void>
  reorderSiblings: (parentId: string | null, orderedIds: string[]) => Promise<void>
  expandItem: (id: string) => void
  collapseItem: (id: string) => void
  toggleExpand: (id: string) => void
  expandAll: () => void
  collapseAll: () => void
  selectItem: (id: string) => void
  deselectItem: (id: string) => void
  toggleSelect: (id: string) => void
  clearSelection: () => void
}

/**
 * Search and filter actions
 */
export interface SearchActions<T> {
  setSearchQuery: (query: string) => void
  setFilters: (filters: Record<string, unknown>) => void
  clearFilters: () => void
  getFilteredItems: () => T[]
}

// ============================================================================
// Store State Types
// ============================================================================

/**
 * Base feature store state
 */
export interface BaseStoreState<T extends BaseStoreItem> {
  items: Map<string, T>
  isLoading: boolean
  error: string | null
  searchQuery: string
  filters: Record<string, unknown>
}

/**
 * Tree store state
 */
export interface TreeStoreState<T extends HierarchicalStoreItem> extends BaseStoreState<T> {
  treeState: TreeState
  flatItems: FlatTreeItem<T>[]
  dndState: DnDState
}

// ============================================================================
// Store Options
// ============================================================================

/**
 * Options for creating a feature store
 */
export interface FeatureStoreOptions {
  /** Store name for devtools/persist */
  name: string
  /** Enable persistence to localStorage */
  persist?: boolean
  /** Persist storage key override */
  persistKey?: string
  /** Enable devtools */
  devtools?: boolean
  /** Initial state override */
  initialState?: Record<string, unknown>
}

/**
 * Options for tree store
 */
export interface TreeStoreOptions extends FeatureStoreOptions {
  /** Maximum depth allowed */
  maxDepth?: number
  /** Allow multi-select */
  multiSelect?: boolean
  /** Initial expanded state: 'all' | 'none' | 'first-level' */
  defaultExpanded?: "all" | "none" | "first-level"
}
