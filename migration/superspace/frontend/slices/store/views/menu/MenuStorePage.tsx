// @dod:skip-uiux013 reason="menus: state handling delegated to tree/list subcomponents"
/**
 * Menu Store Page
 * 
 * Main page component for managing menus with tree structure
 * 3-Panel Layout using ThreeColumnLayoutAdvanced:
 * - Left: Menu Tree with DnD (collapsible)
 * - Middle: Menu Inspector, Available Features, Feature Settings, or Import
 * - Right: Feature Preview Panel (collapsible)
 * 
 * Pattern follows WorkspaceStorePage for consistency.
 */

"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { useQuery } from "convex/react"
import type { Id } from "@/convex/_generated/dataModel"
import { useMenuStoreData, useMenuStoreMutations, useMenuStoreState } from "./hooks"
import { RenameDialog, ShareDialog } from "./dialogs"
import { MenuItemCard, FeatureCard, MenuInspector } from "./components"
import { filterMenuItems, getOriginalFeatureType, getFeatureType } from "./lib"
import { FeatureThreeColumnLayout } from "@/frontend/shared/ui/layout/container"
import {
  FeatureHeader,
  ContainerHeader,
  HeaderControls,
  type FilterChip,
} from "@/frontend/shared/ui/layout/header"
import { useToolbar } from "@/frontend/shared/ui/layout/toolbar"
import { Checkbox } from "@/components/ui/checkbox"
import { PreviewPanel, hasFeaturePreview } from "@/frontend/shared/preview"
import { loadSinglePreview } from "@/frontend/shared/preview/lazy-registry"
import { DragDropMenuTree } from "@/frontend/shared/ui"
import {
  Menu, Plus, RefreshCw, TreeDeciduous, LayoutGrid, Eye, X, Info, Layers,
  Download, Settings, Loader2, Package, Check, Lock, EyeOff, FolderPlus, Sliders
} from "lucide-react"
import { FEATURE_TYPES, STATUS_BADGE_VARIANTS } from "./constants"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Toggle } from "@/components/ui/toggle"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { MenuItem, AvailableFeatureMenu, ViewMode, TabType } from "./types"
// Feature Settings imports
import { SettingsRegistryProvider } from "@/frontend/shared/settings"
import { DynamicSettingsView } from "@/frontend/shared/settings/components/DynamicSettingsView"
import { FeatureSettingsSync } from "@/frontend/shared/settings/components/FeatureSettingsSync"
import { FeatureSettingsListPanel } from "@/frontend/shared/settings/components/FeatureSettingsListPanel"
import { FeatureSettingsPanel } from "@/frontend/shared/settings/components/FeatureSettingsPanel"
import { useIsMobile } from "@/hooks/use-mobile"
import { MobileHeader } from "@/frontend/shared/ui/layout/header"

// ============================================================================
// Stable refs for Available Features toolbar
// ============================================================================

const SORT_OPTIONS = [
  { label: "Name", value: "name" },
  { label: "Status", value: "status" },
  { label: "Category", value: "category" },
  { label: "Version", value: "version" },
]

const FILTER_DIMENSION_KEYS = ["status", "featureType", "category"] as const

// ============================================================================
// Available Features Section
// ============================================================================

interface AvailableFeaturesContentProps {
  features: AvailableFeatureMenu[] | undefined
  installingFeatures?: Set<string>
  onInstall?: (slug: string) => void
  onPreview?: (slug: string) => void
  onSettings?: (slug: string) => void
  onAction?: (slug: string) => void
  activePreviewId: string | null
}

function AvailableFeaturesContent({
  features,
  installingFeatures,
  onInstall,
  onPreview,
  onSettings,
  onAction,
  activePreviewId,
}: AvailableFeaturesContentProps) {
  if (!features || features.length === 0) {
    return (
      <div className="py-12 text-center">
        <Check className="mx-auto mb-4 h-12 w-12 text-green-500" />
        <h3 className="mb-2 text-lg font-semibold">All Features Installed</h3>
        <p className="text-muted-foreground">
          You have installed all available features for this workspace.
        </p>
      </div>
    )
  }

  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-2">
      {features.map((feature) => (
        <FeatureCard
          key={feature.slug}
          feature={feature}
          isInstalling={installingFeatures?.has(feature.slug)}
          onInstall={onInstall}
          onPreview={onPreview}
          onSettings={onSettings}
          onAction={onAction}
          isPreviewActive={activePreviewId === feature.slug}
        />
      ))}
    </div>
  )
}

// ============================================================================
// Import Section Content
// ============================================================================

interface ImportSectionContentProps {
  importMenuId: string
  importing: boolean
  onIdChange: (id: string) => void
  onImport: () => void
}

function ImportSectionContent({
  importMenuId,
  importing,
  onIdChange,
  onImport,
}: ImportSectionContentProps) {
  return (
    <div className="space-y-6">
      <div className="max-w-md space-y-4">
        <div className="space-y-2">
          <Label htmlFor="menuId">Menu ID</Label>
          <Input
            id="menuId"
            placeholder="Enter shareable menu ID..."
            value={importMenuId}
            onChange={(e) => onIdChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && importMenuId.trim() && !importing) {
                onImport()
              }
            }}
          />
        </div>
        <Button aria-label="Download"
          onClick={onImport}
          disabled={!importMenuId.trim() || importing}
          className="w-full"
        >
          {importing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Importing...
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              Import Menu
            </>
          )}
        </Button>
      </div>

      <Card className="max-w-md">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">How to get a Menu ID:</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="list-inside list-decimal space-y-1 text-sm text-muted-foreground">
            <li>Go to the workspace that has the menu you want</li>
            <li>Find the menu item and click "Share"</li>
            <li>Copy the shareable ID and paste it here</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  )
}

// ============================================================================
// Menu Grid Item Component (with Settings, Preview, Action buttons)
// ============================================================================

interface MenuGridItemProps {
  item: MenuItem
  isSelected: boolean
  onSelect: (id: Id<"menuItems">) => void
  onSettings?: (slug: string) => void
  onPreview?: (slug: string) => void
  onShowFeatures?: () => void
  isSystem?: boolean
}

function MenuGridItem({
  item,
  isSelected,
  onSelect,
  onSettings,
  onPreview,
  onShowFeatures,
  isSystem = false,
}: MenuGridItemProps) {
  const featureType = getFeatureType(item)
  const hasValidSlug = item.slug && item.slug !== "#"

  return (
    <div
      className={`group relative p-2.5 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors ${isSelected ? "ring-2 ring-primary bg-muted/30" : ""
        } ${isSystem ? "border-destructive/20 bg-destructive/5" : ""}`}
      onClick={() => onSelect(item._id)}
    >
      <div className="flex items-center gap-2">
        {isSystem ? (
          <Lock className="h-4 w-4 text-destructive/60 flex-shrink-0" />
        ) : (
          <Menu className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        )}
        <span className="text-sm font-medium truncate flex-1">{item.name}</span>

        {/* 3 Hover Buttons - Settings, Preview, Action (for non-system items) */}
        {!isSystem && hasValidSlug && (
          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
            {onSettings && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={(e) => {
                  e.stopPropagation()
                  onSettings(item.slug)
                }}
                title="Settings"
              >
                <Settings className="h-3.5 w-3.5" />
              </Button>
            )}
            {onPreview && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={(e) => {
                  e.stopPropagation()
                  onPreview(item.slug)
                }}
                title="Preview"
              >
                <Eye className="h-3.5 w-3.5" />
              </Button>
            )}
            {onShowFeatures && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={(e) => {
                  e.stopPropagation()
                  onShowFeatures()
                }}
                title="View Details"
              >
                <Info className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        )}
      </div>

      <div className="mt-1.5 flex items-center gap-1 flex-wrap">
        {featureType === "system" && (
          <Badge variant="destructive" className="text-[10px]">System</Badge>
        )}
        {featureType === "optional" && (
          <Badge variant="secondary" className="text-[10px]">Optional</Badge>
        )}
        {item.slug && (
          <Badge variant="outline" className="text-[10px] font-mono">{item.slug}</Badge>
        )}
      </div>
    </div>
  )
}

// ============================================================================
// Main Page Component
// ============================================================================

export interface MenuStorePageProps {
  workspaceId: Id<"workspaces"> | null
}

export function MenuStorePage({ workspaceId }: MenuStorePageProps) {
  // State hooks
  const {
    state,
    setSearchQuery,
    setSelectedItemId,
    setShowForm,
    setEditingItemId,
    setViewMode,
    setActiveTab,
    addInstallingFeature,
    removeInstallingFeature,
    openRenameDialog,
    closeRenameDialog,
    setRenameDialogName,
    openShareDialog,
    closeShareDialog,
    setImportMenuId,
    setImporting,
    setSyncingDefaults,
    setUpdatingFeatureTypeId,
  } = useMenuStoreState()

  const { menuItems, availableFeatures, isLoading } = useMenuStoreData(workspaceId)
  const mutations = useMenuStoreMutations()
  const isMobile = useIsMobile()

  // Feature preview state (for right panel) — single-feature lazy load,
  // matching mock-dashboard. Avoids shipping all 50 preview modules upfront.
  const [selectedFeatureId, setSelectedFeatureId] = React.useState<string | null>(null)
  const [previewVisible, setPreviewVisible] = React.useState(false)
  const [rightPanelCollapsed, setRightPanelCollapsed] = React.useState(true)

  // Feature settings state (for right panel - settings mode)
  const [selectedSettingsFeatureSlug, setSelectedSettingsFeatureSlug] = React.useState<string | null>(null)
  const [settingsVisible, setSettingsVisible] = React.useState(false)

  // Right panel mode: "preview" or "settings"
  const [rightPanelMode, setRightPanelMode] = React.useState<"preview" | "settings">("preview")

  // Center panel mode
  const [centerPanelMode, setCenterPanelMode] = React.useState<"inspector" | "available" | "settings" | "import">("inspector")

  // Available Features toolbar — search/filter/sort (persisted via useToolbar)
  const availToolbar = useToolbar({
    storagePrefix: "menu-store-available",
    initialSort: "name",
  })

  // Derived: filtered + sorted features
  const displayedFeatures = React.useMemo(() => {
    if (!availableFeatures) return undefined

    const q = availToolbar.debouncedSearch.trim().toLowerCase()
    const activeFilters = availToolbar.filters

    let out = availableFeatures.filter((f) => {
      if (q) {
        const hay = `${f.name} ${f.description ?? ""} ${f.slug} ${(f.tags ?? []).join(" ")}`.toLowerCase()
        if (!hay.includes(q)) return false
      }
      // filter chips encoded as `${dim}:${value}`
      // pass if no filter active for a dimension, or if value matches any active for that dim
      const byDim: Record<string, string[]> = {}
      activeFilters.forEach((chip) => {
        const [dim, val] = chip.split(":")
        if (!dim || !val) return
        ;(byDim[dim] ||= []).push(val)
      })
      if (byDim.status && !byDim.status.includes(f.status ?? "stable")) return false
      if (byDim.featureType && !byDim.featureType.includes(f.featureType ?? "default")) return false
      if (byDim.category && !byDim.category.includes(f.category ?? "uncategorized")) return false
      return true
    })

    const field = availToolbar.currentSort ?? "name"
    const dir = availToolbar.sortDirection === "desc" ? -1 : 1
    out = [...out].sort((a, b) => {
      const av = String((a as any)[field] ?? "").toLowerCase()
      const bv = String((b as any)[field] ?? "").toLowerCase()
      return av < bv ? -1 * dir : av > bv ? 1 * dir : 0
    })

    return out
  }, [availableFeatures, availToolbar.debouncedSearch, availToolbar.filters, availToolbar.currentSort, availToolbar.sortDirection])

  // Filter dimension options (derived from data)
  const filterDimensions = React.useMemo(() => {
    const statuses = new Set<string>()
    const types = new Set<string>()
    const categories = new Set<string>()
    availableFeatures?.forEach((f) => {
      statuses.add(f.status ?? "stable")
      types.add(f.featureType ?? "default")
      categories.add(f.category ?? "uncategorized")
    })
    return {
      status: [...statuses].sort(),
      featureType: [...types].sort(),
      category: [...categories].sort(),
    }
  }, [availableFeatures])

  // Build chips from active filters for HeaderControls
  const availFilterChips: FilterChip[] = React.useMemo(() => {
    return [...availToolbar.filters].map((key) => {
      const [dim, val] = key.split(":")
      return { key, label: dim, value: val }
    })
  }, [availToolbar.filters])

  // Filtered menu items - separate system and non-system
  const filteredItems = React.useMemo(() =>
    filterMenuItems(menuItems, state.searchQuery)
    , [menuItems, state.searchQuery])

  // Separate system menus from regular menus
  const { systemMenus, regularMenus } = React.useMemo(() => {
    const system: MenuItem[] = []
    const regular: MenuItem[] = []

    filteredItems.forEach(item => {
      const featureType = getFeatureType(item)
      if (featureType === "system") {
        system.push(item)
      } else {
        regular.push(item)
      }
    })

    return { systemMenus: system, regularMenus: regular }
  }, [filteredItems])

  // Get selected menu item
  const selectedMenuItem = React.useMemo(() => {
    if (!state.selectedItemId || !menuItems) return null
    return menuItems.find(item => item._id === state.selectedItemId) ?? null
  }, [state.selectedItemId, menuItems])

  // Handle feature preview toggle — lazy single-feature import.
  const handleTogglePreview = React.useCallback((featureId: string) => {
    if (selectedFeatureId === featureId && previewVisible) {
      setPreviewVisible(false)
      setRightPanelCollapsed(true)
      return
    }
    void loadSinglePreview(featureId)
      .then(() => {
        setSelectedFeatureId(featureId)
        setPreviewVisible(true)
        setSettingsVisible(false)
        setRightPanelMode("preview")
        setRightPanelCollapsed(false)
      })
      .catch((err) => {
        console.error("[MenuStore] Failed to load feature preview", featureId, err)
      })
  }, [selectedFeatureId, previewVisible])

  // Handle feature settings toggle
  // Handle feature settings toggle - Switch to Center Panel Settings Tab
  const handleToggleSettings = React.useCallback((featureSlug: string) => {
    // Find and select the item
    const item = menuItems?.find(i => i.slug === featureSlug)
    if (item) {
      setSelectedItemId(item._id)
    }
    // Switch to settings tab in center panel
    setCenterPanelMode("settings")
    // Close right panel if it was showing settings
    if (rightPanelMode === "settings") {
      setRightPanelCollapsed(true)
    }
  }, [menuItems, setSelectedItemId, rightPanelMode])

  // Handlers
  const handleDeleteItem = React.useCallback(async (itemId: Id<"menuItems">) => {
    await mutations.deleteMenuItem(itemId, () => {
      if (state.selectedItemId === itemId) {
        setSelectedItemId(undefined)
        // Switch back to inspector if we were in settings of deleted item
        if (centerPanelMode === "settings") {
          setCenterPanelMode("inspector")
        }
      }
    })
  }, [mutations, state.selectedItemId, setSelectedItemId, centerPanelMode])

  const handleInstallFeature = React.useCallback(async (slug: string) => {
    if (!workspaceId) return
    addInstallingFeature(slug)
    try {
      await mutations.installFeature(workspaceId, [slug])
    } finally {
      removeInstallingFeature(slug)
    }
  }, [workspaceId, addInstallingFeature, removeInstallingFeature, mutations])

  const handleRenameConfirm = React.useCallback(async () => {
    if (!state.renameDialog.item) return
    await mutations.renameMenuItem(
      state.renameDialog.item._id,
      state.renameDialog.newName,
      closeRenameDialog
    )
  }, [state.renameDialog, mutations, closeRenameDialog])

  const handleShareItem = React.useCallback(async (item: MenuItem) => {
    const shareableId = await mutations.shareMenuItem(item._id)
    if (shareableId) {
      openShareDialog(shareableId)
    }
  }, [mutations, openShareDialog])

  const handleImportMenu = React.useCallback(async () => {
    if (!workspaceId) return
    setImporting(true)
    try {
      await mutations.importMenu(workspaceId, state.importMenuId, () => {
        setImportMenuId("")
      })
    } finally {
      setImporting(false)
    }
  }, [workspaceId, state.importMenuId, mutations, setImporting, setImportMenuId])

  const handleSyncDefaults = React.useCallback(async () => {
    if (!workspaceId) return
    setSyncingDefaults(true)
    try {
      await mutations.syncDefaults(workspaceId)
    } finally {
      setSyncingDefaults(false)
    }
  }, [workspaceId, mutations, setSyncingDefaults])

  // Handler for creating a new folder with auto-naming
  const handleCreateFolder = React.useCallback(async () => {
    if (!workspaceId || !menuItems) return

    // Find existing "New Folder" names to auto-increment
    const existingFolderNames = menuItems
      .filter(item => item.name.startsWith("New Folder"))
      .map(item => item.name)

    let folderName = "New Folder"
    let counter = 1
    while (existingFolderNames.includes(folderName)) {
      folderName = `New Folder (${counter})`
      counter++
    }

    try {
      const newItemId = await mutations.createMenuItem(workspaceId, {
        name: folderName,
        slug: "#",
        type: "folder",
        icon: "Folder",
      })
      // Select the new folder
      if (newItemId) {
        setSelectedItemId(newItemId)
      }
    } catch (error) {
      // Error is handled in mutation hook
    }
  }, [workspaceId, menuItems, mutations, setSelectedItemId])

  // Early return if no workspace
  if (!workspaceId) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">No workspace selected</p>
      </div>
    )
  }

  // Left Panel Content - Menu Tree with System/Regular separation
  const leftPanelContent = (
    <div className="flex flex-col h-full min-h-0">
      {/* Panel Header */}
      <div className="flex-shrink-0 border-b bg-muted/30">
        <div className="flex items-center justify-between px-3 py-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{filteredItems.length}</span>
            {filteredItems.length !== (menuItems?.length ?? 0) && (
              <span>of {menuItems?.length ?? 0}</span>
            )}
            <span>menus</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="flex border rounded-md">
              <Toggle
                pressed={state.viewMode === "tree"}
                onPressedChange={() => setViewMode("tree")}
                size="sm"
                className="rounded-r-none h-7 w-7 p-0"
              >
                <TreeDeciduous className="h-3.5 w-3.5" />
              </Toggle>
              <Toggle
                pressed={state.viewMode === "grid"}
                onPressedChange={() => setViewMode("grid")}
                size="sm"
                className="rounded-l-none h-7 w-7 p-0"
              >
                <LayoutGrid className="h-3.5 w-3.5" />
              </Toggle>
            </div>
            <Button aria-label="Refresh"
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={handleSyncDefaults}
              disabled={state.syncingDefaults}
            >
              <RefreshCw className={`h-3.5 w-3.5 ${state.syncingDefaults ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>

        {/* Search with Create Folder button */}
        <div className="px-3 pb-2 flex items-center gap-2">
          <div className="flex-1">
            <HeaderControls
              searchable
              searchProps={{
                value: state.searchQuery,
                onChange: setSearchQuery,
                placeholder: "Search menus...",
              }}
              responsive
            />
          </div>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 shrink-0"
            onClick={handleCreateFolder}
            title="Create Folder"
          >
            <FolderPlus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Tree/Grid Content */}
      <ScrollArea className="flex-1 min-h-0">
        {state.viewMode === "tree" ? (
          <div className="p-2">
            <DragDropMenuTree
              workspaceId={workspaceId}
              onItemSelect={setSelectedItemId}
              selectedItemId={state.selectedItemId}
              onSettings={handleToggleSettings}
              onPreview={handleTogglePreview}
              onShowDetails={(itemId) => {
                setSelectedItemId(itemId)
                setCenterPanelMode("inspector")
              }}
            />
          </div>
        ) : (
          <div className="p-2 space-y-4">
            {/* Regular Menus */}
            {regularMenus.length > 0 && (
              <div className="space-y-2">
                <div className="px-1 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Features ({regularMenus.length})
                </div>
                <div className="grid gap-1.5">
                  {regularMenus.map((item) => (
                    <MenuGridItem
                      key={item._id}
                      item={item}
                      isSelected={state.selectedItemId === item._id}
                      onSelect={setSelectedItemId}
                      onSettings={handleToggleSettings}
                      onPreview={handleTogglePreview}
                      onShowFeatures={() => {
                        setSelectedItemId(item._id)
                        setCenterPanelMode("inspector")
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* System Menus - Separated with border */}
            {systemMenus.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-dashed border-destructive/30">
                <div className="px-1 flex items-center gap-1.5 text-xs font-medium text-destructive/70 uppercase tracking-wider">
                  <Lock className="h-3 w-3" />
                  System ({systemMenus.length})
                </div>
                <div className="grid gap-1.5 opacity-75">
                  {systemMenus.map((item) => (
                    <MenuGridItem
                      key={item._id}
                      item={item}
                      isSelected={state.selectedItemId === item._id}
                      onSelect={setSelectedItemId}
                      isSystem
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </ScrollArea>
    </div>
  )

  // Center Panel Content
  const centerPanelContent = (
    <div className="flex flex-col h-full min-h-0">
      {/* Panel Header with Tabs */}
      <div className="flex-shrink-0 border-b bg-muted/30">
        <ContainerHeader
          title={centerPanelMode === "inspector"
            ? "Inspector"
            : centerPanelMode === "available"
              ? "Available Features"
              : centerPanelMode === "settings"
                ? "Feature Settings"
                : "Import Menu"
          }
          subtitle={centerPanelMode === "inspector"
            ? (selectedMenuItem ? "Menu Details" : "Select a menu")
            : centerPanelMode === "available"
              ? `${availableFeatures?.length ?? 0} features available`
              : centerPanelMode === "settings"
                ? "Configure installed features"
                : "Import from another workspace"
          }
          icon={centerPanelMode === "inspector" ? Info : centerPanelMode === "available" ? Package : centerPanelMode === "settings" ? Sliders : Download}
        />

        {/* Unified Toolbar */}
        <div className="px-3 pb-2">
          <div className="flex items-center gap-1 p-1 bg-muted/40 rounded-lg border border-border/50">
            {/* Contextual Group */}
            <div className="flex flex-1 gap-1">
              <Button
                variant={centerPanelMode === "inspector" ? "secondary" : "ghost"}
                size="sm"
                className={cn(
                  "flex-1 text-xs h-7 px-2 font-medium transition-all",
                  centerPanelMode === "inspector" && "bg-background shadow-sm text-foreground",
                  !state.selectedItemId && "opacity-50"
                )}
                onClick={() => setCenterPanelMode("inspector")}
                disabled={!state.selectedItemId}
                title={!state.selectedItemId ? "Select a menu item first" : "View Details"}
              >
                <Info className="h-3.5 w-3.5 mr-1.5" />
                Inspector
              </Button>
              <Button
                variant={centerPanelMode === "settings" ? "secondary" : "ghost"}
                size="sm"
                className={cn(
                  "flex-1 text-xs h-7 px-2 font-medium transition-all",
                  centerPanelMode === "settings" && "bg-background shadow-sm text-foreground",
                  !state.selectedItemId && "opacity-50"
                )}
                onClick={() => setCenterPanelMode("settings")}
                disabled={!state.selectedItemId}
                title={!state.selectedItemId ? "Select a menu item first" : "Feature Settings"}
              >
                <Sliders className="h-3.5 w-3.5 mr-1.5" />
                Settings
              </Button>
            </div>

            {/* Visual Divider */}
            <div className="w-px h-4 bg-border mx-1" />

            {/* Global Group */}
            <div className="flex flex-1 gap-1">
              <Button
                variant={centerPanelMode === "available" ? "secondary" : "ghost"}
                size="sm"
                className={cn(
                  "flex-1 text-xs h-7 px-2 font-medium transition-all",
                  centerPanelMode === "available" && "bg-background shadow-sm text-foreground"
                )}
                onClick={() => setCenterPanelMode("available")}
              >
                <Package className="h-3.5 w-3.5 mr-1.5" />
                Available
              </Button>
              <Button
                variant={centerPanelMode === "import" ? "secondary" : "ghost"}
                size="sm"
                className={cn(
                  "flex-1 text-xs h-7 px-2 font-medium transition-all",
                  centerPanelMode === "import" && "bg-background shadow-sm text-foreground"
                )}
                onClick={() => setCenterPanelMode("import")}
              >
                <Download className="h-3.5 w-3.5 mr-1.5" />
                Import
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Panel Content */}
      <div className="flex-1 min-h-0 overflow-auto">
        {centerPanelMode === "inspector" && (
          <MenuInspector
            menuItem={selectedMenuItem}
            onUpdate={async (menuItemId, data) => {
              await mutations.updateMenuItem(menuItemId, data)
            }}
            onDuplicate={(item) => mutations.duplicateMenuItem(item._id)}
            onShare={handleShareItem}
            onDelete={handleDeleteItem}
            onShowFeatures={selectedMenuItem ? (item) => {
              const featureSlug = item.slug
              if (!featureSlug) return
              void loadSinglePreview(featureSlug)
                .then((preview) => {
                  if (preview || hasFeaturePreview(featureSlug)) {
                    handleTogglePreview(featureSlug)
                  } else {
                    setCenterPanelMode("available")
                  }
                })
                .catch(() => {
                  setCenterPanelMode("available")
                })
            } : undefined}
            isPreviewOpen={previewVisible && selectedMenuItem?.slug === selectedFeatureId}
          />
        )}

        {centerPanelMode === "available" && (
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between gap-2">
              <HeaderControls
                searchable
                searchProps={{
                  value: availToolbar.searchValue,
                  onChange: availToolbar.setSearchValue,
                  placeholder: "Search features...",
                }}
                filterable
                filterProps={{
                  chips: availFilterChips,
                  onRemoveChip: (key) => availToolbar.toggleFilter(key),
                  onClearAll: availToolbar.clearFilters,
                  popoverContent: (
                    <div className="space-y-4">
                      {FILTER_DIMENSION_KEYS.map((dim) => (
                        <div key={dim} className="space-y-2">
                          <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                            {dim}
                          </div>
                          <div className="space-y-1.5">
                            {filterDimensions[dim].map((val) => {
                              const chipKey = `${dim}:${val}`
                              return (
                                <label
                                  key={chipKey}
                                  className="flex items-center gap-2 text-sm cursor-pointer"
                                >
                                  <Checkbox
                                    checked={availToolbar.hasFilter(chipKey)}
                                    onCheckedChange={() => availToolbar.toggleFilter(chipKey)}
                                  />
                                  <span>{val}</span>
                                </label>
                              )
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  ),
                }}
                sortable
                sortProps={{
                  options: SORT_OPTIONS,
                  value: availToolbar.currentSort,
                  direction: availToolbar.sortDirection,
                  onChange: availToolbar.setSort,
                }}
                responsive
              />
              <div className="text-xs text-muted-foreground shrink-0">
                {displayedFeatures?.length ?? 0}
                {displayedFeatures && availableFeatures && displayedFeatures.length !== availableFeatures.length && (
                  <span> of {availableFeatures.length}</span>
                )}
              </div>
            </div>
            {availableFeatures && availableFeatures.length > 0 && (displayedFeatures?.length ?? 0) === 0 ? (
              <div className="py-12 text-center text-muted-foreground">
                <Package className="mx-auto mb-3 h-10 w-10 opacity-40" />
                <p className="text-sm">No features match your search/filter.</p>
              </div>
            ) : (
              <AvailableFeaturesContent
                features={displayedFeatures}
                installingFeatures={state.installingFeatures}
                onInstall={handleInstallFeature}
                onPreview={handleTogglePreview}
                onSettings={handleToggleSettings}
                activePreviewId={previewVisible ? selectedFeatureId : null}
              />
            )}
          </div>
        )}

        {centerPanelMode === "settings" && (
          <div className="h-full">
            {selectedMenuItem?.slug && selectedMenuItem.slug !== "#" ? (
              <FeatureSettingsPanel
                featureSlug={selectedMenuItem.slug}
                featureName={selectedMenuItem.name}
                showBackButton={false}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full p-8 text-center animate-in fade-in-50 duration-500">
                <div className="w-16 h-16 rounded-xl bg-muted/50 flex items-center justify-center mb-6 ring-1 ring-border/50">
                  <Sliders className="h-8 w-8 text-muted-foreground/50" />
                </div>
                <h3 className="font-semibold text-xl tracking-tight mb-2">Configure Feature</h3>
                <p className="text-muted-foreground max-w-xs text-sm leading-relaxed">
                  Select a feature from the menu tree or grid to access its configuration settings.
                </p>
              </div>
            )}
          </div>
        )}

        {centerPanelMode === "import" && (
          <div className="p-4">
            <ImportSectionContent
              importMenuId={state.importMenuId}
              importing={state.importing}
              onIdChange={setImportMenuId}
              onImport={handleImportMenu}
            />
          </div>
        )}
      </div>
    </div>
  )

  // Right Panel Content - Feature Preview or Settings
  const selectedFeatureConfig = React.useMemo(() => {
    if (!selectedFeatureId || !availableFeatures) return null
    return availableFeatures.find((f) => f.slug === selectedFeatureId) ?? null
  }, [selectedFeatureId, availableFeatures])

  // Get the menu item for the selected settings feature
  const selectedSettingsMenuItem = React.useMemo(() => {
    if (!selectedSettingsFeatureSlug || !menuItems) return null
    return menuItems.find(item => item.slug === selectedSettingsFeatureSlug) ?? null
  }, [selectedSettingsFeatureSlug, menuItems])

  const rightPanelContent = (
    <div className="flex flex-col h-full min-h-0">
      {/* Panel Header - adapts based on mode */}
      <div className="flex-shrink-0 border-b bg-muted/30">
        <ContainerHeader
          title={rightPanelMode === "settings"
            ? (selectedSettingsMenuItem?.name ?? "Settings")
            : (selectedFeatureConfig?.name ?? "Preview")
          }
          subtitle={rightPanelMode === "settings"
            ? "Feature configuration"
            : (selectedFeatureConfig?.description ?? "Select a feature to preview")
          }
          icon={rightPanelMode === "settings" ? Sliders : Eye}
          actions={
            (previewVisible || settingsVisible) && (
              <Button aria-label="Close"
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => {
                  if (rightPanelMode === "settings") {
                    setSettingsVisible(false)
                  } else {
                    setPreviewVisible(false)
                  }
                  setRightPanelCollapsed(true)
                }}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            )
          }
        />
      </div>

      {/* Content - Show Preview or Settings based on mode */}
      <div className="flex-1 min-h-0 overflow-auto">
        <PreviewPanel
          featureId={selectedFeatureId}
          visible={previewVisible}
          onClose={() => {
            setPreviewVisible(false)
            setRightPanelCollapsed(true)
          }}
          hideHeader
        />
      </div>
    </div>
  )

  // Mobile View - 3 Level Hierarchical Navigation
  if (isMobile) {
    // Level 3: Preview
    if (previewVisible) {
      return (
        <div className="flex flex-col h-full bg-background">
          <MobileHeader
            title="Preview"
            onBack={() => {
              setPreviewVisible(false)
              setRightPanelCollapsed(true)
            }}
            icon={Eye}
          />
          <div className="flex-1 overflow-hidden">
            <PreviewPanel
              featureId={selectedFeatureId}
              visible={true}
              onClose={() => {
                setPreviewVisible(false)
                setRightPanelCollapsed(true)
              }}
              className="h-full border-0"
              hideHeader
            />
          </div>
        </div>
      )
    }

    // Level 2: Inspector/Settings/Available
    if (state.selectedItemId) {
      return (
        <div className="flex flex-col h-full bg-background">
          <MobileHeader
            title={selectedMenuItem?.name || "Menu"}
            onBack={() => {
              setSelectedItemId(undefined)
              setCenterPanelMode("inspector")
            }}
            icon={Menu}
            actions={
              <div className="flex items-center gap-1">
                <Button aria-label="Info"
                  variant={centerPanelMode === "inspector" ? "secondary" : "ghost"}
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setCenterPanelMode("inspector")}
                >
                  <Info className="h-4 w-4" />
                </Button>
                <Button aria-label="Settings"
                  variant={centerPanelMode === "settings" ? "secondary" : "ghost"}
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setCenterPanelMode("settings")}
                >
                  <Sliders className="h-4 w-4" />
                </Button>
                <Button aria-label="Package"
                  variant={centerPanelMode === "available" ? "secondary" : "ghost"}
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setCenterPanelMode("available")}
                >
                  <Package className="h-4 w-4" />
                </Button>
              </div>
            }
          />
          {centerPanelContent}
        </div>
      )
    }

    // Level 1: Menu List
    return (
      <div className="flex flex-col h-full bg-background">
        <MobileHeader
          title="Menus"
          icon={Menu}
          actions={
            <Button aria-label="Refresh"
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={handleSyncDefaults}
              disabled={state.syncingDefaults}
            >
              <RefreshCw className={`h-4 w-4 ${state.syncingDefaults ? "animate-spin" : ""}`} />
            </Button>
          }
        />
        {leftPanelContent}

        {/* Dialogs */}
        <RenameDialog
          state={state.renameDialog}
          onClose={closeRenameDialog}
          onNameChange={setRenameDialogName}
          onConfirm={handleRenameConfirm}
        />
        <ShareDialog
          state={state.shareDialog}
          onClose={closeShareDialog}
        />
      </div>
    )
  }

  // Desktop View
  return (
    <div className="flex flex-col w-full h-full overflow-hidden">
      {/* Page Header */}
      <div className="flex-shrink-0 border-b">
        <FeatureHeader
          icon={Menu}
          title="Menu Store"
          subtitle="Manage workspace menus and install features"
          primaryAction={{
            label: "Add Menu",
            icon: Plus,
            onClick: () => setShowForm(true),
          }}
          secondaryActions={[
            {
              id: "sync-defaults",
              label: state.syncingDefaults ? "Syncing..." : "Sync",
              icon: state.syncingDefaults ? Loader2 : RefreshCw,
              onClick: handleSyncDefaults,
              disabled: state.syncingDefaults,
            },
          ]}
        />
      </div>

      {/* Three Column Layout */}
      <div className="flex-1 min-h-0">
        <SettingsRegistryProvider>
          <FeatureSettingsSync workspaceId={workspaceId} />
          <FeatureThreeColumnLayout
        rightHidden={false}
            preset="store"
            sidebarContent={leftPanelContent}
            mainContent={centerPanelContent}
            inspector={rightPanelContent}
            // Labels
            leftLabel="Menu Tree"
            centerLabel="Details"
            rightLabel="Preview"
            persistState={true}
            storageKey="menus-layout"
            rightCollapsed={rightPanelCollapsed}
            onRightCollapsedChange={setRightPanelCollapsed}
          />
        </SettingsRegistryProvider>
      </div>

      {/* Dialogs */}
      <RenameDialog
        state={state.renameDialog}
        onClose={closeRenameDialog}
        onNameChange={setRenameDialogName}
        onConfirm={handleRenameConfirm}
      />
      <ShareDialog
        state={state.shareDialog}
        onClose={closeShareDialog}
      />
    </div>
  )
}

export default MenuStorePage
