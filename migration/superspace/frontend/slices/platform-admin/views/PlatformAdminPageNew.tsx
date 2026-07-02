"use client"

import React, { useState, useMemo, useCallback } from "react"
import {
  Shield,
  Activity,
  AlertTriangle,
  Loader2,
  Building2,
  RefreshCw,
  Store,
  Package,
  Save,
  Box,
} from "lucide-react"
import { FeatureThreeColumnLayout } from "@/frontend/shared/ui/layout/container"
import {
  usePlatformAdmin,
  useSystemFeatures,
  useSystemFeatureMutations,
  useBundleCategories,
  useBundleCategoryMutations,
  useErrorReportStats,
  useErrorReportMutations,
} from "../hooks/usePlatformAdmin"
import type { ErrorReportStatus } from "../types"
import {
  AdminNavigation,
  AdminInspector,
  StatCard,
  BundleMultiSelect,
  PlatformUsersTable,
  PlatformInvitationsTable,
  type AdminSection,
  type SelectedBundle,
  type BundleOption,
  type BundleCategoryDataForEdit,
} from "../components"
import { BundleEditInspectorPanel } from "../components/inspector/BundleEditInspectorPanel"
import { FEATURE_TAGS, type FeatureStatus } from "../types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ResponsiveDialog,
} from "@/frontend/shared/ui"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { ConvexErrorBoundary } from "@/frontend/shared/ui/components/error/ConvexErrorBoundary"

// Import content sections
import {
  FeaturesContent,
  AnalyticsContent,
  SettingsContent,
  ErrorReportsContent,
  ChangelogContent,
} from "./content"

// Full workspace management (tree + CRUD + hierarchy)
import { WorkspaceStorePage } from "@/frontend/slices/store"

// Feature categories
const FEATURE_CATEGORIES = [
  "productivity", "communication", "analytics", "integration",
  "management", "development", "ai", "media", "commerce", "system",
] as const

const FEATURE_STATUSES = [
  { value: "stable", label: "Stable" },
  { value: "beta", label: "Beta" },
  { value: "development", label: "Development" },
  { value: "experimental", label: "Experimental" },
  { value: "deprecated", label: "Deprecated" },
] as const

const FEATURE_TYPES = [
  { value: "default", label: "Default" },
  { value: "optional", label: "Optional" },
  { value: "system", label: "System" },
  { value: "premium", label: "Premium" },
] as const

function LoadingState() {
  return (
    <div className="flex flex-col h-full p-6 space-y-6">
      <div className="flex items-center gap-2">
        <Skeleton className="h-8 w-8" />
        <Skeleton className="h-8 w-48" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
      <Skeleton className="h-64 w-full" />
    </div>
  )
}

function AccessDenied() {
  return (
    <div className="flex flex-col items-center justify-center h-full p-6">
      <div className="rounded-full bg-red-500/10 p-4 mb-4">
        <Shield className="h-12 w-12 text-red-500" />
      </div>
      <h1 className="text-2xl font-bold text-center">Access Denied</h1>
      <p className="text-muted-foreground text-center mt-2 max-w-md">
        You don&apos;t have platform administrator access.
        This page is restricted to super admins only.
      </p>
      <Badge variant="outline" className={cn("mt-4", FEATURE_TAGS.admin.color)}>
        {FEATURE_TAGS.admin.label}
      </Badge>
    </div>
  )
}

function PlatformAdminErrorFallback({ error, reset }: { error: Error; reset: () => void }) {
  const message = error?.message ?? "An unexpected error occurred."
  const isAccessError = message.toLowerCase().includes("platform administrator access required")

  if (isAccessError) {
    return (
      <div className="flex flex-col h-full p-6 space-y-4">
        <AccessDenied />
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" onClick={reset}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry access check
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center h-full p-6 space-y-3 text-center">
      <AlertTriangle className="h-10 w-10 text-red-500" />
      <div>
        <h2 className="text-lg font-semibold">Unable to load the admin console</h2>
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
      <Button variant="outline" size="sm" onClick={reset}>
        <RefreshCw className="h-4 w-4 mr-2" />
        Retry
      </Button>
    </div>
  )
}

/**
 * Platform Admin Page with Three Column Layout
 */
function PlatformAdminContent() {
  const { isLoading, isPlatformAdmin, features, workspaces } = usePlatformAdmin()
  const { features: systemFeatures } = useSystemFeatures()
  const { bundles: bundleCategories } = useBundleCategories()
  const { updateFeature } = useSystemFeatureMutations()
  const { setFeatureBundles } = useBundleCategoryMutations()
  const { openCount: openReportCount } = useErrorReportStats()
  const { updateStatus: updateErrorReportStatus } = useErrorReportMutations()

  // Section state
  const [activeSection, setActiveSection] = useState<AdminSection>("system-features")

  // Selected item for inspector
  const [selectedItem, setSelectedItem] = useState<any>(null)

  // Right panel collapsed state
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(true)

  // Mobile view state
  const [mobileView, setMobileView] = useState<'left' | 'center'>('left')

  // Bundle edit state (right panel shows BundleEditInspectorPanel when editing)
  const [editingBundle, setEditingBundle] = useState<BundleCategoryDataForEdit | null>(null)
  const [isBundleEditMode, setIsBundleEditMode] = useState(false)

  // Feature edit sheet state
  const [editingFeature, setEditingFeature] = useState<any | null>(null)
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [selectedBundles, setSelectedBundles] = useState<SelectedBundle[]>([])
  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    version: "",
    category: "productivity",
    status: "stable",
    featureType: "optional",
    icon: "Box",
    tags: [] as string[],
    isReady: true,
    expectedRelease: "",
    isPublic: true,
    isEnabled: true,
  })

  // When selected item changes, exit bundle edit mode
  React.useEffect(() => {
    setIsBundleEditMode(false)
  }, [selectedItem?._id])

  // Bundle options for feature edit sheet
  const bundleOptions: BundleOption[] = useMemo(() => {
    return (bundleCategories ?? []).map((b: any) => ({
      bundleId: b.bundleId,
      name: b.name,
      description: b.description,
      icon: b.icon,
      primaryColor: b.primaryColor,
      category: b.category,
    }))
  }, [bundleCategories])

  // Stats for navigation badges
  const stats = useMemo(() => ({
    features: systemFeatures?.length ?? 0,
    workspaces: workspaces?.length ?? 0,
    users: 0,
    invitations: 0,
    errorReports: openReportCount,
  }), [systemFeatures, workspaces, openReportCount])

  // Handle section change
  const handleSectionChange = useCallback((section: AdminSection) => {
    setActiveSection(section)
    setSelectedItem(null)
    setRightPanelCollapsed(true)
    setMobileView('center')
    setIsBundleEditMode(false)
    setEditingBundle(null)
  }, [])

  // Handle item selection (skip for workspaces — uses its own inspector)
  const handleItemSelect = useCallback((item: any) => {
    if (activeSection === "workspaces") return
    setSelectedItem(item)
    setRightPanelCollapsed(false)
  }, [activeSection])

  // Handle inspector close
  const handleInspectorClose = useCallback(() => {
    setSelectedItem(null)
    setRightPanelCollapsed(true)
    setIsBundleEditMode(false)
    setEditingBundle(null)
  }, [])

  // Handle opening feature edit sheet
  const handleOpenFeatureEdit = useCallback((feature: any) => {
    setEditingFeature(feature)
    setEditForm({
      name: feature.name || "",
      description: feature.description || "",
      version: feature.version || "1.0.0",
      category: feature.category || "productivity",
      status: feature.status || "stable",
      featureType: feature.featureType || "optional",
      icon: feature.icon || "Box",
      tags: feature.tags || [],
      isReady: feature.isReady ?? true,
      expectedRelease: feature.expectedRelease || "",
      isPublic: feature.isPublic ?? true,
      isEnabled: feature.isEnabled ?? true,
    })
    setSelectedBundles([])
    setIsEditSheetOpen(true)
  }, [])

  // Handle opening bundle edit panel
  const handleOpenBundleEdit = useCallback((bundle: any) => {
    setEditingBundle(bundle)
    setIsBundleEditMode(true)
  }, [])

  // Handle "Edit" action from inspector
  const handleInspectorEdit = useCallback(() => {
    if (!selectedItem) return
    if (selectedItem.bundleId) {
      handleOpenBundleEdit(selectedItem)
    } else {
      handleOpenFeatureEdit(selectedItem)
    }
  }, [selectedItem, handleOpenBundleEdit, handleOpenFeatureEdit])

  // Handle saving feature edit
  const handleSaveFeatureEdit = useCallback(async () => {
    if (!editingFeature) return
    setIsSaving(true)
    try {
      await updateFeature(editingFeature._id, {
        ...editForm,
        status: editForm.status as FeatureStatus,
      })
      if (selectedBundles.length > 0) {
        await setFeatureBundles(editingFeature.featureId, selectedBundles)
      }
      toast.success("Feature updated successfully")
      setIsEditSheetOpen(false)
      setEditingFeature(null)
      setSelectedBundles([])
    } catch {
      toast.error("Failed to update feature")
    } finally {
      setIsSaving(false)
    }
  }, [editingFeature, editForm, selectedBundles, updateFeature, setFeatureBundles])

  if (isLoading) return <LoadingState />
  if (!isPlatformAdmin) return <AccessDenied />

  // ============================================================================
  // LEFT PANEL - Navigation
  // ============================================================================
  const leftPanel = (
    <AdminNavigation
      activeSection={activeSection}
      onSectionChange={handleSectionChange}
      stats={stats}
    />
  )

  // ============================================================================
  // CENTER PANEL - Content based on active section
  // ============================================================================
  const showStats = ["system-features", "users"].includes(activeSection)

  const statsRow = showStats && (
    <div className="flex gap-3 overflow-x-auto scrollbar-hide sm:grid sm:grid-cols-2 sm:overflow-visible lg:grid-cols-4 p-4 border-b bg-muted/20">
      <StatCard
        className="flex-none w-44 sm:w-auto"
        title="Total Workspaces"
        value={workspaces.length}
        description="Active workspaces"
        icon={Building2}
      />
      <StatCard
        className="flex-none w-44 sm:w-auto"
        title="System Features"
        value={systemFeatures?.length ?? 0}
        description="In Menu Store"
        icon={Store}
      />
      <StatCard
        className="flex-none w-44 sm:w-auto"
        title="Bundles"
        value={bundleCategories?.length ?? 0}
        description="Available bundles"
        icon={Package}
      />
      <StatCard
        className="flex-none w-44 sm:w-auto"
        title="System Health"
        value="100%"
        description="All operational"
        icon={Activity}
      />
    </div>
  )

  let sectionContent: React.ReactNode

  switch (activeSection) {
    case "system-features":
      sectionContent = (
        <FeaturesContent
          features={features}
          onItemSelect={handleItemSelect}
          selectedItemId={selectedItem?._id}
        />
      )
      break

    case "workspaces":
      sectionContent = <WorkspaceStorePage />
      break

    case "users":
      sectionContent = (
        <div className="p-4">
          <PlatformUsersTable />
        </div>
      )
      break

    case "invitations":
      sectionContent = (
        <div className="p-4">
          <PlatformInvitationsTable />
        </div>
      )
      break

    case "error-reports":
      sectionContent = (
        <ErrorReportsContent
          onItemSelect={handleItemSelect}
          selectedItemId={selectedItem?._id}
        />
      )
      break

    case "analytics":
      sectionContent = <AnalyticsContent />
      break

    case "changelog":
      sectionContent = <ChangelogContent />
      break

    case "settings":
      sectionContent = <SettingsContent />
      break

    default:
      sectionContent = (
        <div className="flex items-center justify-center h-full text-muted-foreground">
          <p>Select a section from the navigation</p>
        </div>
      )
  }

  const centerPanel = (
    <div className="flex flex-col h-full min-h-0">
      {statsRow}
      <div className="flex-1 min-h-0 overflow-auto">
        {sectionContent}
      </div>
    </div>
  )

  // ============================================================================
  // RIGHT PANEL - Inspector (or BundleEditInspectorPanel when editing a bundle)
  // ============================================================================
  const rightPanel =
    activeSection === "system-features" && isBundleEditMode && editingBundle ? (
      <BundleEditInspectorPanel
        bundle={editingBundle}
        onClose={() => {
          setIsBundleEditMode(false)
          setEditingBundle(null)
        }}
        onSaved={(nextBundle) => {
          setEditingBundle(nextBundle)
          setSelectedItem(nextBundle)
        }}
      />
    ) : (
      <AdminInspector
        section={activeSection}
        selectedItem={selectedItem}
        onEdit={handleInspectorEdit}
        onDelete={() => {
          // TODO: Confirm and delete
        }}
        onChangeStatus={async (status: ErrorReportStatus) => {
          if (!selectedItem?._id) return
          try {
            await updateErrorReportStatus(selectedItem._id, status)
            setSelectedItem((prev: any) => (prev ? { ...prev, status } : prev))
            toast.success("Status updated")
          } catch (err) {
            toast.error(err instanceof Error ? err.message : "Failed to update status")
          }
        }}
        onClose={handleInspectorClose}
      />
    )

  return (
    <div className="flex h-full flex-col overflow-hidden bg-background">
      <FeatureThreeColumnLayout
        rightHidden={false}
        preset="admin"
        leftLabel="Features"
        centerLabel="Feature Details"
        rightLabel="Settings"
        sidebarContent={leftPanel}
        mobileLeftHeader={null}
        mainContent={centerPanel}
        inspector={rightPanel}
        persistState={true}
        storageKey="platform-admin-layout"
        rightCollapsed={rightPanelCollapsed}
        onRightCollapsedChange={setRightPanelCollapsed}
        mobileView={mobileView}
        onMobileViewChange={setMobileView}
      />

      {/* Feature Edit Sheet */}
      <ResponsiveDialog open={isEditSheetOpen} onOpenChange={setIsEditSheetOpen} variant="panel" sheetSide="right" contentClassName="sm:max-w-[540px]">
        <ResponsiveDialog.Header>
          <ResponsiveDialog.Title>Edit Feature</ResponsiveDialog.Title>
          <ResponsiveDialog.Description>Update feature configuration and settings</ResponsiveDialog.Description>
        </ResponsiveDialog.Header>

        <ResponsiveDialog.Body className="px-4 py-6 sm:px-6">
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Details</Label>
                <Input
                  value={editForm.name}
                  onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Feature Name"
                />
                <Textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Description"
                />
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="space-y-0.5">
                  <Label>Publicly Available</Label>
                  <div className="text-xs text-muted-foreground">Visible to users in Menu Store?</div>
                </div>
                <Switch
                  checked={editForm.isPublic}
                  onCheckedChange={(c) => setEditForm(prev => ({ ...prev, isPublic: c }))}
                />
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="space-y-0.5">
                  <Label>Feature Enabled</Label>
                  <div className="text-xs text-muted-foreground">Globally enabled?</div>
                </div>
                <Switch
                  checked={editForm.isEnabled}
                  onCheckedChange={(c) => setEditForm(prev => ({ ...prev, isEnabled: c }))}
                />
              </div>

              <div className="space-y-2">
                <Label>Bundles</Label>
                <BundleMultiSelect
                  value={selectedBundles}
                  onChange={setSelectedBundles}
                  options={bundleOptions}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={editForm.status}
                    onValueChange={(v) => setEditForm(prev => ({ ...prev, status: v }))}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {FEATURE_STATUSES.map(s => (
                        <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select
                    value={editForm.featureType}
                    onValueChange={(v) => setEditForm(prev => ({ ...prev, featureType: v }))}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {FEATURE_TYPES.map(t => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
        </ResponsiveDialog.Body>

        <ResponsiveDialog.Footer className="flex-col-reverse sm:flex-row">
          <Button variant="outline" onClick={() => setIsEditSheetOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveFeatureEdit} disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <Save className="mr-2 h-4 w-4" />
            Save Changes
          </Button>
        </ResponsiveDialog.Footer>
      </ResponsiveDialog>
    </div>
  )
}

/**
 * Main Page Component with Error Boundary.
 */
export default function PlatformAdminPageNew() {
  return (
    <div className="h-full bg-background animate-in fade-in duration-500">
      <ConvexErrorBoundary fallback={(error, reset) => <PlatformAdminErrorFallback error={error} reset={reset} />}>
        <PlatformAdminContent />
      </ConvexErrorBoundary>
    </div>
  )
}
