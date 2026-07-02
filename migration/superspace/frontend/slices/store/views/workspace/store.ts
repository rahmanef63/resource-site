/**
 * Workspace Store
 * 
 * Zustand store for workspace management with tree structure support
 */

import { create } from "zustand"
import { devtools, persist } from "zustand/middleware"
import { immer } from "zustand/middleware/immer"
import { enableMapSet } from "immer"
import {
  buildTree,
  flattenTree,
  getAncestorIds,
  getDescendantIds,
} from "@/frontend/shared/foundation/stores"
import type { WorkspaceStoreItem, WorkspaceStoreState, WorkspaceStoreActions } from "./types"

// Enable Immer plugins for Map and Set support
enableMapSet()

// ============================================================================
// Initial State
// ============================================================================

const initialState: WorkspaceStoreState = {
  // Data
  workspaces: new Map(),
  tree: [],
  flatItems: [],
  
  // UI State
  isLoading: false,
  error: null,
  searchQuery: "",
  
  // Tree State
  expandedIds: new Set(),
  selectedIds: new Set(),
  focusedId: null,
  
  // DnD State
  isDragging: false,
  draggedId: null,
  overId: null,
  
  // Dialogs
  createDialogOpen: false,
  editDialogOpen: false,
  deleteDialogOpen: false,
  linkDialogOpen: false,
  iconPickerOpen: false,
  colorPickerOpen: false,
  
  // Current editing item
  editingWorkspaceId: null,
}

// ============================================================================
// Store
// ============================================================================

export const useWorkspaceStore = create<WorkspaceStoreState & WorkspaceStoreActions>()(
  devtools(
    immer((set, get) => ({
      ...initialState,

      // ========================================
      // Data Actions
      // ========================================
      
      setWorkspaces: (workspaces) => {
        set((state) => {
          // Build map
          state.workspaces = new Map(workspaces.map((w) => [w.id, w]))
          
          // Build tree
          state.tree = buildTree(workspaces, null)
          
          // Flatten tree for rendering
          state.flatItems = flattenTree(state.tree, state.expandedIds)
        })
      },

      setLoading: (loading) => {
        set((state) => {
          state.isLoading = loading
        })
      },

      setError: (error) => {
        set((state) => {
          state.error = error
        })
      },

      // ========================================
      // Search
      // ========================================
      
      setSearchQuery: (query) => {
        set((state) => {
          state.searchQuery = query
          
          // If searching, expand all to show results
          if (query.trim()) {
            const lowerQuery = query.toLowerCase()
            const matchingAncestors = new Set<string>()
            
            for (const workspace of state.workspaces.values()) {
              if (workspace.name.toLowerCase().includes(lowerQuery)) {
                // Add all ancestors to expanded
                workspace.path.forEach((id) => matchingAncestors.add(id))
              }
            }
            
            state.expandedIds = matchingAncestors
          }
          
          // Rebuild flat items with new expansion
          state.flatItems = flattenTree(state.tree, state.expandedIds)
        })
      },

      // ========================================
      // Tree Actions
      // ========================================
      
      toggleExpand: (id) => {
        set((state) => {
          if (state.expandedIds.has(id)) {
            state.expandedIds.delete(id)
          } else {
            state.expandedIds.add(id)
          }
          state.flatItems = flattenTree(state.tree, state.expandedIds)
        })
      },

      expandAll: () => {
        set((state) => {
          for (const id of state.workspaces.keys()) {
            state.expandedIds.add(id)
          }
          state.flatItems = flattenTree(state.tree, state.expandedIds)
        })
      },

      collapseAll: () => {
        set((state) => {
          state.expandedIds.clear()
          state.flatItems = flattenTree(state.tree, state.expandedIds)
        })
      },

      setExpanded: (ids) => {
        set((state) => {
          state.expandedIds = new Set(ids)
          state.flatItems = flattenTree(state.tree, state.expandedIds)
        })
      },

      // ========================================
      // Selection
      // ========================================
      
      selectWorkspace: (id) => {
        set((state) => {
          state.selectedIds.clear()
          state.selectedIds.add(id)
          state.focusedId = id
        })
      },

      deselectWorkspace: (id) => {
        set((state) => {
          state.selectedIds.delete(id)
          if (state.focusedId === id) {
            state.focusedId = null
          }
        })
      },

      toggleSelect: (id) => {
        set((state) => {
          if (state.selectedIds.has(id)) {
            state.selectedIds.delete(id)
          } else {
            state.selectedIds.add(id)
          }
        })
      },

      clearSelection: () => {
        set((state) => {
          state.selectedIds.clear()
          state.focusedId = null
        })
      },

      setFocused: (id) => {
        set((state) => {
          state.focusedId = id
        })
      },

      // ========================================
      // DnD
      // ========================================
      
      setDragging: (isDragging, draggedId) => {
        set((state) => {
          state.isDragging = isDragging
          state.draggedId = draggedId
        })
      },

      setOverId: (overId) => {
        set((state) => {
          state.overId = overId
        })
      },

      // ========================================
      // Dialogs
      // ========================================
      
      openCreateDialog: () => {
        set((state) => {
          state.createDialogOpen = true
        })
      },

      closeCreateDialog: () => {
        set((state) => {
          state.createDialogOpen = false
        })
      },

      openEditDialog: (workspaceId) => {
        set((state) => {
          state.editDialogOpen = true
          state.editingWorkspaceId = workspaceId
        })
      },

      closeEditDialog: () => {
        set((state) => {
          state.editDialogOpen = false
          state.editingWorkspaceId = null
        })
      },

      openDeleteDialog: (workspaceId) => {
        set((state) => {
          state.deleteDialogOpen = true
          state.editingWorkspaceId = workspaceId
        })
      },

      closeDeleteDialog: () => {
        set((state) => {
          state.deleteDialogOpen = false
          state.editingWorkspaceId = null
        })
      },

      openLinkDialog: () => {
        set((state) => {
          state.linkDialogOpen = true
        })
      },

      closeLinkDialog: () => {
        set((state) => {
          state.linkDialogOpen = false
        })
      },

      openIconPicker: (workspaceId) => {
        set((state) => {
          state.iconPickerOpen = true
          state.editingWorkspaceId = workspaceId
        })
      },

      closeIconPicker: () => {
        set((state) => {
          state.iconPickerOpen = false
          state.editingWorkspaceId = null
        })
      },

      openColorPicker: (workspaceId) => {
        set((state) => {
          state.colorPickerOpen = true
          state.editingWorkspaceId = workspaceId
        })
      },

      closeColorPicker: () => {
        set((state) => {
          state.colorPickerOpen = false
          state.editingWorkspaceId = null
        })
      },

      // ========================================
      // Utilities
      // ========================================
      
      getWorkspace: (id) => {
        return get().workspaces.get(id)
      },

      getChildren: (parentId) => {
        const workspaces = get().workspaces
        const children: WorkspaceStoreItem[] = []
        
        for (const workspace of workspaces.values()) {
          if (workspace.parentId === parentId) {
            children.push(workspace)
          }
        }
        
        return children.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
      },

      getSiblings: (id) => {
        const workspaces = get().workspaces
        const workspace = workspaces.get(id)
        if (!workspace) return []
        
        const siblings: WorkspaceStoreItem[] = []
        
        for (const ws of workspaces.values()) {
          if (ws.id !== id && ws.parentId === workspace.parentId) {
            siblings.push(ws)
          }
        }
        
        return siblings.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
      },

      getAncestors: (id) => {
        const workspaces = get().workspaces
        const ancestorIds = getAncestorIds(id, workspaces)
        return ancestorIds
          .map((aid) => workspaces.get(aid))
          .filter(Boolean) as WorkspaceStoreItem[]
      },

      getDescendants: (id) => {
        const workspaces = get().workspaces
        const descendantIds = getDescendantIds(id, workspaces)
        return descendantIds
          .map((did) => workspaces.get(did))
          .filter(Boolean) as WorkspaceStoreItem[]
      },

      // ========================================
      // Reset
      // ========================================
      
      reset: () => {
        set(initialState)
      },
    })),
    { name: "workspace-store" }
  )
)

// ============================================================================
// Selectors
// ============================================================================

export const selectWorkspaces = (state: WorkspaceStoreState) => state.workspaces
export const selectTree = (state: WorkspaceStoreState) => state.tree
export const selectFlatItems = (state: WorkspaceStoreState) => state.flatItems
export const selectIsLoading = (state: WorkspaceStoreState) => state.isLoading
export const selectError = (state: WorkspaceStoreState) => state.error
export const selectSearchQuery = (state: WorkspaceStoreState) => state.searchQuery
export const selectExpandedIds = (state: WorkspaceStoreState) => state.expandedIds
export const selectSelectedIds = (state: WorkspaceStoreState) => state.selectedIds
export const selectFocusedId = (state: WorkspaceStoreState) => state.focusedId
export const selectIsDragging = (state: WorkspaceStoreState) => state.isDragging
export const selectDraggedId = (state: WorkspaceStoreState) => state.draggedId
export const selectOverId = (state: WorkspaceStoreState) => state.overId
export const selectEditingWorkspaceId = (state: WorkspaceStoreState) => state.editingWorkspaceId

// Dialog selectors
export const selectCreateDialogOpen = (state: WorkspaceStoreState) => state.createDialogOpen
export const selectEditDialogOpen = (state: WorkspaceStoreState) => state.editDialogOpen
export const selectDeleteDialogOpen = (state: WorkspaceStoreState) => state.deleteDialogOpen
export const selectLinkDialogOpen = (state: WorkspaceStoreState) => state.linkDialogOpen
export const selectIconPickerOpen = (state: WorkspaceStoreState) => state.iconPickerOpen
export const selectColorPickerOpen = (state: WorkspaceStoreState) => state.colorPickerOpen

// Computed selectors
export const selectWorkspaceById = (id: string) => (state: WorkspaceStoreState) => 
  state.workspaces.get(id)

export const selectRootWorkspaces = (state: WorkspaceStoreState) => {
  const roots: WorkspaceStoreItem[] = []
  for (const workspace of state.workspaces.values()) {
    if (workspace.parentId === null) {
      roots.push(workspace)
    }
  }
  return roots.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
}

export const selectMainWorkspace = (state: WorkspaceStoreState) => {
  for (const workspace of state.workspaces.values()) {
    if (workspace.isMainWorkspace) {
      return workspace
    }
  }
  return null
}

export const selectFilteredFlatItems = (state: WorkspaceStoreState) => {
  const query = state.searchQuery.toLowerCase().trim()
  if (!query) return state.flatItems
  
  return state.flatItems.filter((item) =>
    item.data.name.toLowerCase().includes(query)
  )
}
