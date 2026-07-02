/**
 * Workspace Store State Hook
 * 
 * Provides UI state management for workspace store
 */
"use client"
import { useCallback, useState } from "react"
import { useWorkspaceStore } from "../store"
import type { WorkspaceFilters } from "../types"

/**
 * Hook for workspace store UI state
 */
export function useWorkspaceStoreState() {
  // Tree state
  const expandedIds = useWorkspaceStore((s) => s.expandedIds)
  const selectedIds = useWorkspaceStore((s) => s.selectedIds)
  const focusedId = useWorkspaceStore((s) => s.focusedId)
  
  // Actions
  const toggleExpand = useWorkspaceStore((s) => s.toggleExpand)
  const expandAll = useWorkspaceStore((s) => s.expandAll)
  const collapseAll = useWorkspaceStore((s) => s.collapseAll)
  const setExpanded = useWorkspaceStore((s) => s.setExpanded)
  const selectWorkspace = useWorkspaceStore((s) => s.selectWorkspace)
  const deselectWorkspace = useWorkspaceStore((s) => s.deselectWorkspace)
  const toggleSelect = useWorkspaceStore((s) => s.toggleSelect)
  const clearSelection = useWorkspaceStore((s) => s.clearSelection)
  const setFocused = useWorkspaceStore((s) => s.setFocused)
  
  // Search
  const searchQuery = useWorkspaceStore((s) => s.searchQuery)
  const setSearchQuery = useWorkspaceStore((s) => s.setSearchQuery)
  
  // Get first selected ID
  const selectedId = selectedIds.size > 0 ? Array.from(selectedIds)[0] : null
  
  return {
    // State
    expandedIds,
    selectedIds,
    selectedId,
    focusedId,
    searchQuery,
    
    // Actions
    toggleExpand,
    toggleExpanded: toggleExpand, // Alias
    expandAll,
    collapseAll,
    setExpanded,
    selectWorkspace,
    setSelectedId: selectWorkspace, // Alias
    deselectWorkspace,
    toggleSelect,
    clearSelection,
    setFocused,
    setSearchQuery,
    
    // Helpers
    isExpanded: useCallback((id: string) => expandedIds.has(id), [expandedIds]),
    isSelected: useCallback((id: string) => selectedIds.has(id), [selectedIds]),
    isFocused: useCallback((id: string) => focusedId === id, [focusedId]),
  }
}

/**
 * Hook for workspace filters
 */
export function useWorkspaceStoreFilters() {
  const [filters, setFiltersState] = useState<WorkspaceFilters>({})
  const setSearchQuery = useWorkspaceStore((s) => s.setSearchQuery)
  
  const setFilters = useCallback((newFilters: Partial<WorkspaceFilters>) => {
    setFiltersState((prev) => ({ ...prev, ...newFilters }))
  }, [])
  
  const setSearch = useCallback((search: string) => {
    setFiltersState((prev) => ({ ...prev, search }))
    setSearchQuery(search)
  }, [setSearchQuery])
  
  const clearFilters = useCallback(() => {
    setFiltersState({})
    setSearchQuery("")
  }, [setSearchQuery])
  
  return {
    filters,
    setFilters,
    setSearch,
    clearFilters,
  }
}

/**
 * Hook for DnD state
 */
export function useWorkspaceDnDState() {
  const isDragging = useWorkspaceStore((s) => s.isDragging)
  const draggedId = useWorkspaceStore((s) => s.draggedId)
  const overId = useWorkspaceStore((s) => s.overId)
  
  const setDragging = useWorkspaceStore((s) => s.setDragging)
  const setOverId = useWorkspaceStore((s) => s.setOverId)
  
  return {
    isDragging,
    draggedId,
    overId,
    setDragging,
    setOverId,
    
    // Helpers
    isDraggedItem: useCallback((id: string) => draggedId === id, [draggedId]),
    isOverItem: useCallback((id: string) => overId === id, [overId]),
  }
}

// Alias for consistency
export const useWorkspaceStoreDnD = useWorkspaceDnDState

/**
 * Hook for dialog state
 */
export function useWorkspaceDialogs() {
  const createDialogOpen = useWorkspaceStore((s) => s.createDialogOpen)
  const editDialogOpen = useWorkspaceStore((s) => s.editDialogOpen)
  const deleteDialogOpen = useWorkspaceStore((s) => s.deleteDialogOpen)
  const linkDialogOpen = useWorkspaceStore((s) => s.linkDialogOpen)
  const iconPickerOpen = useWorkspaceStore((s) => s.iconPickerOpen)
  const colorPickerOpen = useWorkspaceStore((s) => s.colorPickerOpen)
  const editingWorkspaceId = useWorkspaceStore((s) => s.editingWorkspaceId)
  
  const openCreateDialog = useWorkspaceStore((s) => s.openCreateDialog)
  const closeCreateDialog = useWorkspaceStore((s) => s.closeCreateDialog)
  const openEditDialog = useWorkspaceStore((s) => s.openEditDialog)
  const closeEditDialog = useWorkspaceStore((s) => s.closeEditDialog)
  const openDeleteDialog = useWorkspaceStore((s) => s.openDeleteDialog)
  const closeDeleteDialog = useWorkspaceStore((s) => s.closeDeleteDialog)
  const openLinkDialog = useWorkspaceStore((s) => s.openLinkDialog)
  const closeLinkDialog = useWorkspaceStore((s) => s.closeLinkDialog)
  const openIconPicker = useWorkspaceStore((s) => s.openIconPicker)
  const closeIconPicker = useWorkspaceStore((s) => s.closeIconPicker)
  const openColorPicker = useWorkspaceStore((s) => s.openColorPicker)
  const closeColorPicker = useWorkspaceStore((s) => s.closeColorPicker)
  
  return {
    // State
    createDialogOpen,
    editDialogOpen,
    deleteDialogOpen,
    linkDialogOpen,
    iconPickerOpen,
    colorPickerOpen,
    editingWorkspaceId,
    
    // Actions
    openCreateDialog,
    closeCreateDialog,
    openEditDialog,
    closeEditDialog,
    openDeleteDialog,
    closeDeleteDialog,
    openLinkDialog,
    closeLinkDialog,
    openIconPicker,
    closeIconPicker,
    openColorPicker,
    closeColorPicker,
  }
}
