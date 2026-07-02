// @dod:skip-uiux013 reason="workspace-store: state handling delegated to tree/list subcomponents"
/**
 * Workspace Store Page - Refactored
 * 
 * Main page component for managing workspaces with three-column layout
 * Uses extracted components and utility functions for DRY, SSOT principles
 */

"use client"

import * as React from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { api as apiUntyped } from "@/frontend/shared/foundation/utils/convex/any-api"
import type { Id } from "@/convex/_generated/dataModel"
import { useWorkspaceStoreData, useWorkspaceStoreFiltered } from "./hooks/useWorkspaceStoreData"
import { useWorkspaceStoreMutations } from "./hooks/useWorkspaceStoreMutations"
import { useWorkspaceStoreState, useWorkspaceStoreFilters } from "./hooks/useWorkspaceStoreState"
import dynamic from "next/dynamic"
import {
  EditWorkspaceDialog,
  DeleteWorkspaceDialog,
  MoveWorkspaceDialog,
} from "./components"
// Heavy 5-tab dialog pulls in AiOnboardingFlow (852 LOC), RobustOnboardingFlow
// (448 LOC), IndustryTemplateCreatePanel (252 LOC), Import/Join panels.
// Only rendered when user clicks "+ New Workspace" — load on demand.
const CreateWorkspaceAdvancedDialog = dynamic(
  () => import("@/frontend/shared/foundation/workspaces/components/CreateWorkspaceAdvancedDialog")
    .then((mod) => ({ default: mod.CreateWorkspaceAdvancedDialog })),
  { ssr: false },
)
import {
  getAllFeaturePreviews,
  loadAllFeaturePreviews,
} from "@/frontend/shared/preview"
import { FeatureThreeColumnLayout } from "@/frontend/shared/ui/layout/container"
import { FeatureHeader } from "@/frontend/shared/ui/layout/header"
import { Boxes, Plus, Sliders, Eye, X, Package, Info, Check } from "lucide-react"
import { WORKSPACE_TYPE_OPTIONS } from "./constants"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { SettingsRegistryProvider } from "@/frontend/shared/settings"
import { FeatureSettingsPanel } from "@/frontend/shared/settings/components/FeatureSettingsPanel"
import { MobileHeader } from "@/frontend/shared/ui/layout/header"
import { PreviewPanel } from "@/frontend/shared/preview"
import type { WorkspaceStoreItem, WorkspaceType, MoveWorkspaceData } from "./types"
import type { PanelMode } from "@/lib/utils/panel-config"
import { WorkspaceLeftPanel, WorkspaceCenterPanel, WorkspaceRightPanel } from "./lib/components"
import { getMoveTargets, hasWorkspaceChildren } from "@/lib/utils/workspace-store"
import type { WorkspaceTemplate } from "@/lib/workspaces/templates"

export function WorkspaceStorePage() {
  // Data hooks
  const { workspaces, isLoading, refetch } = useWorkspaceStoreData()
  const workspacesArray = React.useMemo(() => Array.isArray(workspaces) ? workspaces : [], [workspaces])

  // State hooks
  const storeState = useWorkspaceStoreState()
  const { filters, setFilters, setSearch, clearFilters } = useWorkspaceStoreFilters()
  const filteredWorkspaces = useWorkspaceStoreFiltered(filters)

  // Mutations
  const mutations = useWorkspaceStoreMutations()
  const installTemplate = useMutation(api.features.industryTemplates.mutations.installTemplate)

  // View mode state
  const [viewMode, setViewMode] = React.useState<"tree" | "list">("tree")

  // Center panel mode
  const [centerPanelMode, setCenterPanelMode] = React.useState<PanelMode>("inspector")

  // Right panel mode
  const [rightPanelMode, setRightPanelMode] = React.useState<"preview" | "settings">("preview")

  // Feature settings state
  const [selectedSettingsFeatureSlug, setSelectedSettingsFeatureSlug] = React.useState<string | null>(null)
  const [settingsVisible, setSettingsVisible] = React.useState(false)

  // Feature preview state
  const [selectedFeatureId, setSelectedFeatureId] = React.useState<string | null>(null)
  const [previewVisible, setPreviewVisible] = React.useState(false)
  const [rightPanelCollapsed, setRightPanelCollapsed] = React.useState(true)

  const [previewsLoaded, setPreviewsLoaded] = React.useState(false)
  const [previewsLoading, setPreviewsLoading] = React.useState(false)

  // Load feature previews when workspace is selected
  React.useEffect(() => {
    if (previewsLoaded || previewsLoading) return
    // Load previews when workspace is selected or when on features/installed tab
    if (!storeState.selectedId) return

    let cancelled = false
    setPreviewsLoading(true)

    loadAllFeaturePreviews()
      .then(() => { if (!cancelled) setPreviewsLoaded(true) })
      .catch((err) => console.error("[WorkspaceStore] Failed to load feature previews", err))
      .finally(() => { if (!cancelled) setPreviewsLoading(false) })

    return () => { cancelled = true }
  }, [storeState.selectedId, previewsLoaded, previewsLoading])

  const allFeaturePreviews = React.useMemo(
    () => previewsLoaded ? getAllFeaturePreviews() : [],
    [previewsLoaded]
  )

  // Query menu items for selected workspace
  const workspaceMenuItems = useQuery(
    apiUntyped["features/menus/menuItems"]?.getWorkspaceMenuItems,
    storeState.selectedId ? { workspaceId: storeState.selectedId as Id<"workspaces"> } : "skip"
  ) as Array<{ slug: string; name: string; isVisible: boolean }> | undefined

  // Filter feature previews to only show workspace's enabled features
  const featurePreviews = React.useMemo(() => {
    if (!workspaceMenuItems || workspaceMenuItems.length === 0) return []
    const enabledFeatureSlugs = new Set(
      workspaceMenuItems.filter(item => item.isVisible !== false).map(item => item.slug)
    )
    return allFeaturePreviews.filter(preview => enabledFeatureSlugs.has(preview.featureId))
  }, [allFeaturePreviews, workspaceMenuItems])

  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = React.useState(false)
  const [editDialogOpen, setEditDialogOpen] = React.useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false)
  const [moveDialogOpen, setMoveDialogOpen] = React.useState(false)
  const [parentForCreate, setParentForCreate] = React.useState<WorkspaceStoreItem | null>(null)
  const [workspaceToEdit, setWorkspaceToEdit] = React.useState<WorkspaceStoreItem | null>(null)
  const [workspaceToDelete, setWorkspaceToDelete] = React.useState<WorkspaceStoreItem | null>(null)
  const [workspaceToMove, setWorkspaceToMove] = React.useState<WorkspaceStoreItem | null>(null)
  const [initialTemplate, setInitialTemplate] = React.useState<WorkspaceTemplate | null>(null)

  // Search state for workspace tree
  const [workspaceSearch, setWorkspaceSearch] = React.useState("")

  // Debounced search effect
  React.useEffect(() => {
    const timer = setTimeout(() => setSearch(workspaceSearch), 300)
    return () => clearTimeout(timer)
  }, [workspaceSearch, setSearch])

  // Selected workspace info
  const selectedWorkspace = React.useMemo(() => {
    if (!storeState.selectedId) return null
    return workspacesArray.find((w) => w.id === storeState.selectedId) ?? null
  }, [storeState.selectedId, workspacesArray])

  // =================================================================
  // Event Handlers
  // =================================================================

  const handleCreateClick = React.useCallback(() => {
    setParentForCreate(null)
    setInitialTemplate(null)
    setCreateDialogOpen(true)
  }, [])

  const handleCreateChild = React.useCallback((parent: WorkspaceStoreItem) => {
    setParentForCreate(parent)
    setInitialTemplate(null)
    setCreateDialogOpen(true)
  }, [])

  const handleUseTemplate = React.useCallback((template: WorkspaceTemplate) => {
    setParentForCreate(null)
    setInitialTemplate(template)
    setCreateDialogOpen(true)
  }, [])

  const handleEdit = React.useCallback((workspace: WorkspaceStoreItem) => {
    setWorkspaceToEdit(workspace)
    setEditDialogOpen(true)
  }, [])

  const handleDelete = React.useCallback((workspace: WorkspaceStoreItem) => {
    setWorkspaceToDelete(workspace)
    setDeleteDialogOpen(true)
  }, [])

  const handleMove = React.useCallback((workspace: WorkspaceStoreItem) => {
    setWorkspaceToMove(workspace)
    setMoveDialogOpen(true)
  }, [])

  const handleSetColor = React.useCallback(async (workspace: WorkspaceStoreItem, color: string) => {
    await mutations.setColor(workspace.id, color)
  }, [mutations])

  const handleSetIcon = React.useCallback(async (workspace: WorkspaceStoreItem, icon: string) => {
    await mutations.updateWorkspace(workspace.id, { icon })
  }, [mutations])

  const handleUnlink = React.useCallback(async (workspace: WorkspaceStoreItem) => {
    await mutations.setParent(workspace.id, null)
  }, [mutations])

  const handleShowFeatures = React.useCallback((workspace: WorkspaceStoreItem) => {
    storeState.setSelectedId(workspace.id)
    setCenterPanelMode("features")
  }, [storeState])

  const handleCreateSubmit = React.useCallback(async (data: {
    name: string
    description?: string
    type: WorkspaceType
    icon?: string
    color?: string
    bundleId?: string
    parentId?: string
    templateId?: Id<"industryTemplates">
    enabledFeatures?: string[]
  }) => {
    const workspaceId = await mutations.createWorkspace({
      name: data.name,
      description: data.description,
      type: data.type,
      icon: data.icon,
      color: data.color ?? "#808080", // Default color if undefined
      bundleId: data.bundleId,
      enabledFeatures: data.enabledFeatures,
      parentId: data.parentId,
    })

    if (workspaceId && data.templateId) {
      await installTemplate({
        templateId: data.templateId,
        workspaceId: workspaceId as Id<"workspaces">,
        options: {
          includeSampleData: true,
          selectedFeatures: [], // Template defaults
        }
      })
    }
  }, [mutations, installTemplate])

  const handleEditSubmit = React.useCallback(async (data: {
    name: string
    description?: string
    type: WorkspaceType
    icon?: string
    color?: string
  }) => {
    if (!workspaceToEdit) return
    await mutations.updateWorkspace(workspaceToEdit.id, data)
  }, [mutations, workspaceToEdit])

  const handleDeleteConfirm = React.useCallback(async () => {
    if (!workspaceToDelete) return
    await mutations.deleteWorkspace(workspaceToDelete.id)
  }, [mutations, workspaceToDelete])

  const handleMoveSubmit = React.useCallback(async (targetParentId: string | null) => {
    if (!workspaceToMove) return
    await mutations.setParent(workspaceToMove.id, targetParentId)
  }, [mutations, workspaceToMove])

  const handleDnDMove = React.useCallback(async (data: MoveWorkspaceData) => {
    await mutations.moveWorkspace(data)
  }, [mutations])

  const handleTogglePreview = React.useCallback((featureId: string) => {
    if (selectedFeatureId === featureId && previewVisible) {
      setPreviewVisible(false)
      setRightPanelCollapsed(true)
    } else {
      setSelectedFeatureId(featureId)
      setPreviewVisible(true)
      setRightPanelCollapsed(false)
    }
  }, [selectedFeatureId, previewVisible])

  const handleToggleSettings = React.useCallback((featureSlug: string, featureName?: string) => {
    if (selectedSettingsFeatureSlug === featureSlug && settingsVisible) {
      setSettingsVisible(false)
      setRightPanelCollapsed(true)
    } else {
      setSelectedSettingsFeatureSlug(featureSlug)
      setSettingsVisible(true)
      setPreviewVisible(false)
      setRightPanelMode("settings")
      setRightPanelCollapsed(false)
    }
  }, [selectedSettingsFeatureSlug, settingsVisible])

  const handleInspectorUpdate = React.useCallback(async (workspaceId: string, data: Partial<WorkspaceStoreItem>) => {
    await mutations.updateWorkspace(workspaceId, data)
  }, [mutations])

  // Calculate available move targets
  const moveTargets = React.useMemo(() => {
    if (!workspaceToMove) return [] as WorkspaceStoreItem[]
    return getMoveTargets(workspaceToMove, workspacesArray)
  }, [workspacesArray, workspaceToMove])

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-background">
      <FeatureThreeColumnLayout
        rightHidden={false}
        preset="store"
        leftLabel="Workspaces"
        centerLabel="Details"
        rightLabel="Preview"
        sidebarContent={
          <WorkspaceLeftPanel
            workspaces={workspacesArray}
            filteredWorkspaces={filteredWorkspaces}
            selectedId={storeState.selectedId}
            onSelect={(ws) => storeState.setSelectedId(ws.id)}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onMove={handleDnDMove}
            onCreate={handleCreateClick}
            onAddChild={handleCreateChild}
            onColorChange={handleSetColor}
            onIconChange={handleSetIcon}
            onUnlink={handleUnlink}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            searchValue={workspaceSearch}
            onSearchChange={setWorkspaceSearch}
            typeOptions={WORKSPACE_TYPE_OPTIONS}
            filters={filters}
            onFiltersChange={setFilters}
            onClearFilters={clearFilters}
            isLoading={isLoading}
            onRefresh={refetch}
            onShowFeatures={handleShowFeatures}
          />
        }
        mainContent={
          <WorkspaceCenterPanel
            mode={centerPanelMode}
            selectedWorkspace={selectedWorkspace}
            featurePreviews={featurePreviews}
            selectedFeatureId={selectedFeatureId}
            previewVisible={previewVisible}
            selectedSettingsSlug={selectedSettingsFeatureSlug}
            settingsVisible={settingsVisible}
            workspaceMenuItems={workspaceMenuItems}
            isLoadingPreviews={previewsLoading}
            onModeChange={setCenterPanelMode}
            onTogglePreview={handleTogglePreview}
            onToggleSettings={handleToggleSettings}
            onInspectorUpdate={handleInspectorUpdate}
            onShowFeatures={() => setCenterPanelMode("features")}
            onUseTemplate={handleUseTemplate}
          />
        }
        inspector={
          <WorkspaceRightPanel
            mode={rightPanelMode}
            selectedFeatureId={selectedFeatureId}
            selectedSettingsSlug={selectedSettingsFeatureSlug}
            previewVisible={previewVisible}
            settingsVisible={settingsVisible}
            featurePreviews={featurePreviews}
            onClose={() => setRightPanelCollapsed(true)}
          />
        }
        persistState={true}
        storageKey="workspace-store-layout"
        rightCollapsed={rightPanelCollapsed}
        onRightCollapsedChange={setRightPanelCollapsed}
      />

      <CreateWorkspaceAdvancedDialog
        open={createDialogOpen}
        onOpenChange={(nextOpen) => {
          setCreateDialogOpen(nextOpen)
          if (!nextOpen) {
            setInitialTemplate(null)
          }
        }}
        parentWorkspaceId={parentForCreate?.id}
        onSubmit={handleCreateSubmit}
        initialTemplate={initialTemplate}
      />

      <EditWorkspaceDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        workspace={workspaceToEdit}
        onSubmit={handleEditSubmit}
      />

      <DeleteWorkspaceDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        workspace={workspaceToDelete}
        onConfirm={handleDeleteConfirm}
      />

      <MoveWorkspaceDialog
        open={moveDialogOpen}
        onOpenChange={setMoveDialogOpen}
        workspace={workspaceToMove}
        availableTargets={moveTargets}
        onSubmit={handleMoveSubmit}
      />
    </div>
  )
}

export default WorkspaceStorePage
