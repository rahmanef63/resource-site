/**
 * Workspace Store Types
 * 
 * Type definitions for workspace management feature
 */

import type { Id, Doc } from "@/convex/_generated/dataModel"
import type { HierarchicalStoreItem, TreeNode, FlatTreeItem } from "@/frontend/shared/foundation/stores"

// Re-export WorkspaceType from SSOT
export type { WorkspaceType } from "@/frontend/shared/constants/workspace-types"
import type { WorkspaceType } from "@/frontend/shared/constants/workspace-types"

// ============================================================================
// Workspace Types
// ============================================================================

/**
 * Workspace store item - extends base hierarchical item
 */
export interface WorkspaceStoreItem extends HierarchicalStoreItem {
  _id: Id<"workspaces">
  name: string
  slug: string
  description?: string
  type: WorkspaceType
  icon?: string
  color: string
  isPublic: boolean
  isMainWorkspace?: boolean
  isLinked?: boolean
  shareDataToParent: boolean
  settings?: {
    allowInvites?: boolean
    allowGuestOnly?: boolean
    requireApproval?: boolean
    defaultRoleId?: Id<"roles">
    icon?: string
  }
  createdBy: Id<"users">
  _creationTime: number
}

/**
 * Workspace tree node
 */
export type WorkspaceTreeNode = TreeNode<WorkspaceStoreItem>

/**
 * Flat workspace item for lists
 */
export type FlatWorkspaceItem = FlatTreeItem<WorkspaceStoreItem>

// ============================================================================
// Store State Types
// ============================================================================

/**
 * Workspace store state
 */
export interface WorkspaceStoreState {
  // Data
  workspaces: Map<string, WorkspaceStoreItem>
  tree: WorkspaceTreeNode[]
  flatItems: FlatWorkspaceItem[]
  
  // UI State
  isLoading: boolean
  error: string | null
  searchQuery: string
  
  // Tree State
  expandedIds: Set<string>
  selectedIds: Set<string>
  focusedId: string | null
  
  // DnD State
  isDragging: boolean
  draggedId: string | null
  overId: string | null
  
  // Dialogs
  createDialogOpen: boolean
  editDialogOpen: boolean
  deleteDialogOpen: boolean
  linkDialogOpen: boolean
  iconPickerOpen: boolean
  colorPickerOpen: boolean
  
  // Current editing item
  editingWorkspaceId: string | null
}

/**
 * Workspace store actions
 */
export interface WorkspaceStoreActions {
  // Data actions
  setWorkspaces: (workspaces: WorkspaceStoreItem[]) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  
  // Search
  setSearchQuery: (query: string) => void
  
  // Tree actions
  toggleExpand: (id: string) => void
  expandAll: () => void
  collapseAll: () => void
  setExpanded: (ids: string[]) => void
  
  // Selection
  selectWorkspace: (id: string) => void
  deselectWorkspace: (id: string) => void
  toggleSelect: (id: string) => void
  clearSelection: () => void
  setFocused: (id: string | null) => void
  
  // DnD
  setDragging: (isDragging: boolean, draggedId: string | null) => void
  setOverId: (overId: string | null) => void
  
  // Dialogs
  openCreateDialog: () => void
  closeCreateDialog: () => void
  openEditDialog: (workspaceId: string) => void
  closeEditDialog: () => void
  openDeleteDialog: (workspaceId: string) => void
  closeDeleteDialog: () => void
  openLinkDialog: () => void
  closeLinkDialog: () => void
  openIconPicker: (workspaceId: string) => void
  closeIconPicker: () => void
  openColorPicker: (workspaceId: string) => void
  closeColorPicker: () => void
  
  // Utilities
  getWorkspace: (id: string) => WorkspaceStoreItem | undefined
  getChildren: (parentId: string | null) => WorkspaceStoreItem[]
  getSiblings: (id: string) => WorkspaceStoreItem[]
  getAncestors: (id: string) => WorkspaceStoreItem[]
  getDescendants: (id: string) => WorkspaceStoreItem[]
  
  // Reset
  reset: () => void
}

// ============================================================================
// Form Types
// ============================================================================

/**
 * Create workspace form data
 */
export interface CreateWorkspaceFormData {
  name: string
  slug?: string
  description?: string
  type: WorkspaceType
  color: string
  icon?: string
  bundleId?: string
  enabledFeatures?: string[]
  parentId?: string | null
  isPublic?: boolean
}

/**
 * Update workspace form data
 */
export interface UpdateWorkspaceFormData {
  name?: string
  slug?: string
  description?: string
  type?: WorkspaceType
  color?: string
  icon?: string
  isPublic?: boolean
  shareDataToParent?: boolean
}

/**
 * Move workspace data
 */
export interface MoveWorkspaceData {
  workspaceId: string
  newParentId: string | null
  newSortOrder: number
}

/**
 * Workspace filters
 */
export interface WorkspaceFilters {
  search?: string
  types?: WorkspaceType[]
  hasChildren?: boolean
  hierarchyLevel?: number
}

// ============================================================================
// Component Props Types
// ============================================================================

/**
 * Workspace card props
 */
export interface WorkspaceCardProps {
  workspace: WorkspaceStoreItem
  isSelected?: boolean
  isExpanded?: boolean
  onSelect?: () => void
  onToggleExpand?: () => void
  onEdit?: () => void
  onDelete?: () => void
  onColorChange?: (color: string) => void
  onIconChange?: (icon: string) => void
  depth?: number
  isDragging?: boolean
  isOver?: boolean
}

/**
 * Workspace tree props
 */
export interface WorkspaceTreeProps {
  workspaces: WorkspaceStoreItem[]
  selectedId?: string | null
  expandedIds?: Set<string>
  onSelect?: (id: string) => void
  onToggleExpand?: (id: string) => void
  onMove?: (data: MoveWorkspaceData) => void
  showActions?: boolean
  maxDepth?: number
}

/**
 * Icon picker props
 */
export interface IconPickerProps {
  value?: string
  onChange: (icon: string) => void
  onClose: () => void
}

/**
 * Color picker props
 */
export interface ColorPickerProps {
  value?: string
  onChange: (color: string) => void
  onClose: () => void
  colors?: string[]
}
