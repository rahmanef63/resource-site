/**
 * Workspace Store Mutations Hook
 * 
 * Provides mutation functions for workspace operations
 */

"use client"

import { useCallback } from "react"
import { useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import { useWorkspaceStore } from "../store"
import { usePostWorkspaceDeleteNavigation } from "@/frontend/shared/foundation/workspaces/hooks/usePostWorkspaceDeleteNavigation"
import type { CreateWorkspaceFormData, UpdateWorkspaceFormData, MoveWorkspaceData } from "../types"
import { toast } from "sonner"

/**
 * Hook for workspace CRUD mutations
 */
export function useWorkspaceStoreMutations() {
  // Convex mutations
  const createWorkspaceMutation = useMutation(api.workspace.workspaces.createWorkspace)
  const updateWorkspaceMutation = useMutation(api.workspace.workspaces.updateWorkspace)
  const deleteWorkspaceMutation = useMutation(api.workspace.workspaces.deleteWorkspace)
  const setParentMutation = useMutation(api.workspace.hierarchy.setWorkspaceParent)
  const setColorMutation = useMutation(api.workspace.hierarchy.setWorkspaceColor)
  const linkWorkspaceMutation = useMutation(api.workspace.hierarchy.linkWorkspaceAsChild)
  const unlinkWorkspaceMutation = useMutation(api.workspace.hierarchy.unlinkChildWorkspace)
  const fixHierarchyMutation = useMutation(api.workspace.hierarchy.fixCorruptedHierarchy)
  
  // Store actions
  const closeCreateDialog = useWorkspaceStore((s) => s.closeCreateDialog)
  const closeEditDialog = useWorkspaceStore((s) => s.closeEditDialog)
  const closeDeleteDialog = useWorkspaceStore((s) => s.closeDeleteDialog)
  const closeLinkDialog = useWorkspaceStore((s) => s.closeLinkDialog)
  const closeColorPicker = useWorkspaceStore((s) => s.closeColorPicker)
  const closeIconPicker = useWorkspaceStore((s) => s.closeIconPicker)
  const navigateAfterWorkspaceDelete = usePostWorkspaceDeleteNavigation()
  
  /**
   * Create a new workspace
   */
  const createWorkspace = useCallback(async (data: CreateWorkspaceFormData) => {
    try {
      const workspaceId = await createWorkspaceMutation({
        name: data.name,
        description: data.description,
        type: data.type,
        icon: data.icon,
        color: data.color,
        bundleId: data.bundleId,
        enabledFeatures: data.enabledFeatures,
        parentWorkspaceId: data.parentId ? (data.parentId as Id<"workspaces">) : undefined,
        isPublic: data.isPublic ?? false,
      })

      toast.success("Workspace created successfully")
      closeCreateDialog()
      
      return workspaceId
    } catch (error) {
      console.error("Failed to create workspace:", error)
      toast.error("Failed to create workspace")
      throw error
    }
  }, [createWorkspaceMutation, closeCreateDialog])
  
  /**
   * Update an existing workspace
   */
  const updateWorkspace = useCallback(async (
    workspaceId: string,
    data: UpdateWorkspaceFormData
  ) => {
    try {
      await updateWorkspaceMutation({
        workspaceId: workspaceId as Id<"workspaces">,
        name: data.name,
        description: data.description,
        isPublic: data.isPublic,
        icon: data.icon,
        color: data.color,
      })
      
      toast.success("Workspace updated successfully")
      closeEditDialog()
    } catch (error) {
      console.error("Failed to update workspace:", error)
      toast.error("Failed to update workspace")
      throw error
    }
  }, [updateWorkspaceMutation, closeEditDialog])
  
  /**
   * Delete a workspace
   */
  const deleteWorkspace = useCallback(async (workspaceId: string) => {
    try {
      await deleteWorkspaceMutation({
        workspaceId: workspaceId as Id<"workspaces">,
      })

      navigateAfterWorkspaceDelete(workspaceId as Id<"workspaces">)
      toast.success("Workspace deleted successfully")
      closeDeleteDialog()
    } catch (error) {
      console.error("Failed to delete workspace:", error)
      toast.error("Failed to delete workspace")
      throw error
    }
  }, [closeDeleteDialog, deleteWorkspaceMutation, navigateAfterWorkspaceDelete])
  
  /**
   * Move workspace to new parent (for DnD)
   */
  const moveWorkspace = useCallback(async (data: MoveWorkspaceData) => {
    try {
      if (data.newParentId) {
        await setParentMutation({
          workspaceId: data.workspaceId as Id<"workspaces">,
          parentWorkspaceId: data.newParentId as Id<"workspaces">,
        })
      } else {
        // Moving to root - remove parent
        await setParentMutation({
          workspaceId: data.workspaceId as Id<"workspaces">,
          parentWorkspaceId: undefined as unknown as Id<"workspaces">,
        })
      }
      
      toast.success("Workspace moved successfully")
    } catch (error) {
      console.error("Failed to move workspace:", error)
      toast.error("Failed to move workspace")
      throw error
    }
  }, [setParentMutation])
  
  /**
   * Set parent workspace (simplified API)
   */
  const setParent = useCallback(async (workspaceId: string, parentId: string | null) => {
    try {
      await setParentMutation({
        workspaceId: workspaceId as Id<"workspaces">,
        parentWorkspaceId: parentId ? (parentId as Id<"workspaces">) : undefined as unknown as Id<"workspaces">,
      })
      
      toast.success("Workspace moved successfully")
    } catch (error) {
      console.error("Failed to set parent:", error)
      toast.error("Failed to move workspace")
      throw error
    }
  }, [setParentMutation])
  
  /**
   * Set workspace color
   */
  const setColor = useCallback(async (workspaceId: string, color: string) => {
    try {
      await setColorMutation({
        workspaceId: workspaceId as Id<"workspaces">,
        color,
      })
      
      toast.success("Color updated")
      closeColorPicker()
    } catch (error) {
      console.error("Failed to set color:", error)
      toast.error("Failed to update color")
      throw error
    }
  }, [setColorMutation, closeColorPicker])
  
  /**
   * Set workspace icon
   */
  const setIcon = useCallback(async (workspaceId: string, icon: string) => {
    try {
      // Update workspace with new icon
      await updateWorkspaceMutation({
        workspaceId: workspaceId as Id<"workspaces">,
        icon,
      })
      
      toast.success("Icon updated")
      closeIconPicker()
    } catch (error) {
      console.error("Failed to set icon:", error)
      toast.error("Failed to update icon")
      throw error
    }
  }, [updateWorkspaceMutation, closeIconPicker])
  
  /**
   * Link a workspace as child
   */
  const linkWorkspace = useCallback(async (parentId: string, childId: string) => {
    try {
      await linkWorkspaceMutation({
        parentWorkspaceId: parentId as Id<"workspaces">,
        childWorkspaceId: childId as Id<"workspaces">,
      })
      
      toast.success("Workspace linked successfully")
      closeLinkDialog()
    } catch (error) {
      console.error("Failed to link workspace:", error)
      toast.error("Failed to link workspace")
      throw error
    }
  }, [linkWorkspaceMutation, closeLinkDialog])
  
  /**
   * Unlink a child workspace
   */
  const unlinkWorkspace = useCallback(async (parentId: string, childId: string) => {
    try {
      await unlinkWorkspaceMutation({
        parentWorkspaceId: parentId as Id<"workspaces">,
        childWorkspaceId: childId as Id<"workspaces">,
      })
      
      toast.success("Workspace unlinked successfully")
    } catch (error) {
      console.error("Failed to unlink workspace:", error)
      toast.error("Failed to unlink workspace")
      throw error
    }
  }, [unlinkWorkspaceMutation])
  
  /**
   * Fix all workspace hierarchies
   */
  const fixAllHierarchies = useCallback(async (workspaceId?: string) => {
    if (!workspaceId) {
      toast.info("Select a workspace first to run hierarchy fix")
      return { fixed: false }
    }

    try {
      const result = await fixHierarchyMutation({
        workspaceId: workspaceId as Id<"workspaces">,
      })

      if (result.fixed) {
        toast.success("Hierarchy issues fixed successfully")
      } else {
        toast.success("Workspace hierarchy looks healthy")
      }
      
      return result
    } catch (error) {
      console.error("Failed to fix hierarchies:", error)
      toast.error("Failed to fix hierarchies")
      throw error
    }
  }, [fixHierarchyMutation])
  
  return {
    // CRUD operations
    createWorkspace,
    updateWorkspace,
    deleteWorkspace,
    moveWorkspace,
    setColor,
    setIcon,
    linkWorkspace,
    unlinkWorkspace,
    fixAllHierarchies,
    setParent,
    // Aliases for simpler API
    create: createWorkspace,
    update: updateWorkspace,
    delete: deleteWorkspace,
    move: moveWorkspace,
  }
}
