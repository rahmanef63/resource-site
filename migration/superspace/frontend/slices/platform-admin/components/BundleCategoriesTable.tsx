/**
 * Bundle Categories Configuration Tab
 * 
 * A tab panel for managing bundle categories in the Platform Admin.
 * Allows creating, editing, and deleting bundle categories with
 * full metadata configuration (name, icon, colors, etc.)
 */

"use client"

import React, { useState, useMemo } from "react"
import {
  Plus,
  Trash2,
  X,
  Loader2,
  Search,
  Filter,
  Download,
  MoreHorizontal,
  Package,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Skeleton } from "@/components/ui/skeleton"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
import { useBundleCategories, useBundleCategoryMutations } from "../hooks/usePlatformAdmin"
import { useTableSortAndFilter, ColumnDef } from "../hooks/useTableSortAndFilter"
import { EnhancedTableHeader } from "./EnhancedTableHeader"
import type { Id } from "@/convex/_generated/dataModel"
import { ColorPickerSimple } from "@/components/ui/shadcn-io/color-picker/ColorPickerSimple"
import { IconPicker, getIconComponent } from "@/frontend/shared/ui/icons"

// Bundle category types
const BUNDLE_CATEGORIES = [
  { value: "productivity", label: "Productivity", color: "bg-blue-500" },
  { value: "business", label: "Business", color: "bg-green-500" },
  { value: "personal", label: "Personal", color: "bg-purple-500" },
  { value: "creative", label: "Creative", color: "bg-pink-500" },
  { value: "education", label: "Education", color: "bg-yellow-500" },
  { value: "community", label: "Community", color: "bg-teal-500" },
] as const

// Workspace types
const WORKSPACE_TYPES = [
  { value: "personal", label: "Personal" },
  { value: "family", label: "Family" },
  { value: "group", label: "Group" },
  { value: "organization", label: "Organization" },
  { value: "institution", label: "Institution" },
] as const

// Icons are now loaded from IconPicker component

type BundleCategory = "productivity" | "business" | "personal" | "creative" | "education" | "community"
type WorkspaceType = "personal" | "family" | "group" | "organization" | "institution"

interface BundleCategoryData {
  _id: Id<"bundleCategories">
  bundleId: string
  name: string
  description: string
  icon: string
  category: BundleCategory
  primaryColor?: string
  accentColor?: string
  recommendedFor: WorkspaceType[]
  tags: string[]
  isEnabled: boolean
  isPublic: boolean
  order: number
  isSystem?: boolean
  createdAt: number
  updatedAt?: number
}

interface BundleFormState {
  bundleId: string
  name: string
  description: string
  icon: string
  category: BundleCategory
  primaryColor: string
  accentColor: string
  recommendedFor: WorkspaceType[]
  tags: string[]
  isEnabled: boolean
  isPublic: boolean
}

const defaultFormState: BundleFormState = {
  bundleId: "",
  name: "",
  description: "",
  icon: "Package",
  category: "productivity",
  primaryColor: "#6366f1",
  accentColor: "",
  recommendedFor: ["personal"],
  tags: [],
  isEnabled: true,
  isPublic: true,
}

export interface BundleCategoriesTableProps {
  onItemSelect?: (bundle: BundleCategoryData) => void
  selectedItemId?: Id<"bundleCategories"> | string | null
}

export function BundleCategoriesTable({ onItemSelect, selectedItemId }: BundleCategoriesTableProps) {
  const { bundles, isLoading } = useBundleCategories()
  const {
    createBundle,
    removeBundle,
    seedBundles
  } = useBundleCategoryMutations()

  // Define columns for sorting and filtering
  const columns: ColumnDef<BundleCategoryData>[] = [
    {
      key: "name",
      label: "Bundle",
      sortable: true,
      filterable: true,
    },
    {
      key: "bundleId",
      label: "Bundle ID",
      sortable: true,
      filterable: true,
    },
    {
      key: "category",
      label: "Category",
      sortable: true,
      filterable: true,
    },
    {
      key: "createdAt",
      label: "Created",
      sortable: true,
      sortFn: (a, b) => a.createdAt - b.createdAt,
    },
  ]

  // Use the sorting and filtering hook
  const {
    searchQuery,
    filters,
    sortConfig,
    setSearchQuery,
    handleSort,
    handleFilter,
    clearFilters,
    hasActiveFilters,
    processedData: filteredBundles,
  } = useTableSortAndFilter({
    data: bundles,
    columns,
    initialFilters: { category: null },
  })

  // State
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isSeeding, setIsSeeding] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Form state
  const [newBundle, setNewBundle] = useState<BundleFormState>(defaultFormState)

  // Handlers
  const handleCreateBundle = async () => {
    if (!newBundle.bundleId || !newBundle.name) {
      toast.error("Bundle ID and Name are required")
      return
    }
    setIsSaving(true)
    try {
      await createBundle({
        bundleId: newBundle.bundleId,
        name: newBundle.name,
        description: newBundle.description,
        icon: newBundle.icon,
        category: newBundle.category,
        primaryColor: newBundle.primaryColor || undefined,
        accentColor: newBundle.accentColor || undefined,
        recommendedFor: newBundle.recommendedFor,
        tags: newBundle.tags,
        isEnabled: newBundle.isEnabled,
        isPublic: newBundle.isPublic,
      })
      toast.success("Bundle category created successfully")
      setIsCreateDialogOpen(false)
      setNewBundle(defaultFormState)
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error)
      toast.error(msg || "Failed to create bundle category")
      console.error(error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (bundle: BundleCategoryData) => {
    if (bundle.isSystem) {
      toast.error("Cannot delete system bundle categories")
      return
    }
    if (!confirm(`Are you sure you want to delete "${bundle.name}"?`)) return
    try {
      await removeBundle(bundle._id)
      toast.success("Bundle category deleted")
    } catch (error) {
      toast.error("Failed to delete bundle category")
    }
  }

  const handleSeedBundles = async () => {
    setIsSeeding(true)
    try {
      const result = await seedBundles()
      toast.success(`Seeded ${result.created} bundles, ${result.skipped} skipped`)
    } catch (error) {
      toast.error("Failed to seed bundle categories")
    } finally {
      setIsSeeding(false)
    }
  }

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredBundles.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(filteredBundles.map((b: BundleCategoryData) => b._id)))
    }
  }

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedIds(newSelected)
  }

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full" />
        ))}
      </div>
    )
  }

  if (bundles.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>No bundle categories configured yet.</p>
        <p className="text-sm mb-4">
          Seed the default bundle categories to get started.
        </p>
        <Button aria-label="Download" onClick={handleSeedBundles} disabled={isSeeding}>
          {isSeeding ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Seeding...
            </>
          ) : (
            <>
              <Download className="h-4 w-4 mr-2" />
              Seed Default Bundles
            </>
          )}
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search bundles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>

        {/* Category Filter */}
        <Select
          value={filters.category || "all"}
          onValueChange={(v) => handleFilter("category", v === "all" ? null : v)}
        >
          <SelectTrigger className="w-[150px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {BUNDLE_CATEGORIES.map((cat) => (
              <SelectItem key={cat.value} value={cat.value}>
                {cat.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {hasActiveFilters && (
          <Button aria-label="Close" variant="ghost" size="icon" onClick={clearFilters}>
            <X className="h-4 w-4" />
          </Button>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 ml-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSeedBundles}
            disabled={isSeeding}
          >
            {isSeeding ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            Sync
          </Button>

          <Button size="sm" onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Bundle
          </Button>
        </div>
      </div>

      {/* Results count */}
      <div className="text-sm text-muted-foreground">
        Showing {filteredBundles.length} of {bundles.length} bundle categories
      </div>

      {/* Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="hidden sm:table-cell w-[40px]">
                <Checkbox
                  checked={
                    selectedIds.size === filteredBundles.length &&
                    filteredBundles.length > 0
                  }
                  onCheckedChange={toggleSelectAll}
                />
              </TableHead>
              <EnhancedTableHeader
                sortable={true}
                sortDirection={sortConfig.key === "name" ? sortConfig.direction : null}
                isActive={sortConfig.key === "name"}
                onSort={() => handleSort("name")}
              >
                Bundle
              </EnhancedTableHeader>
              <EnhancedTableHeader
                sortable={true}
                sortDirection={sortConfig.key === "category" ? sortConfig.direction : null}
                isActive={sortConfig.key === "category"}
                onSort={() => handleSort("category")}
                className="hidden md:table-cell w-[120px]"
              >
                Category
              </EnhancedTableHeader>
              <TableHead className="hidden lg:table-cell w-[80px]">Color</TableHead>
              <TableHead className="hidden lg:table-cell w-[100px]">Workspace Types</TableHead>
              <TableHead className="hidden lg:table-cell w-[70px] text-center">Public</TableHead>
              <TableHead className="hidden lg:table-cell w-[70px] text-center">Enabled</TableHead>
              <TableHead className="w-[80px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredBundles.map((bundle: BundleCategoryData) => (
              <TableRow
                key={bundle._id}
                className={cn(
                  !bundle.isEnabled && "opacity-50",
                  selectedIds.has(bundle._id) && "bg-muted/50",
                  selectedItemId && String(bundle._id) === String(selectedItemId) && "bg-muted/40"
                )}
                onClick={() => onItemSelect?.(bundle)}
              >
                <TableCell className="hidden sm:table-cell">
                  <div onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={selectedIds.has(bundle._id)}
                      onCheckedChange={() => toggleSelect(bundle._id)}
                    />
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="font-medium truncate">{bundle.name}</span>
                      {bundle.isSystem && (
                        <Badge
                          variant="outline"
                          className="text-xs bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
                        >
                          System
                        </Badge>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground font-mono truncate">
                      {bundle.bundleId}
                    </span>
                    {bundle.description && (
                      <span className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                        {bundle.description}
                      </span>
                    )}

                    {/* Mobile/compact metadata to avoid horizontal scrolling */}
                    <div className="mt-1 flex flex-wrap gap-1 md:hidden">
                      <Badge variant="secondary" className="capitalize text-xs">
                        {bundle.category}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {bundle.isPublic ? "Public" : "Private"}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {bundle.isEnabled ? "Enabled" : "Disabled"}
                      </Badge>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <Badge variant="secondary" className="capitalize">
                    {bundle.category}
                  </Badge>
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  {bundle.primaryColor && (
                    <div
                      className="w-6 h-6 rounded-full border"
                      style={{ backgroundColor: bundle.primaryColor }}
                      title={bundle.primaryColor}
                    />
                  )}
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  <div className="flex flex-wrap gap-1">
                    {bundle.recommendedFor.slice(0, 2).map((type) => (
                      <Badge key={type} variant="outline" className="text-xs">
                        {type}
                      </Badge>
                    ))}
                    {bundle.recommendedFor.length > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{bundle.recommendedFor.length - 2}
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell className="hidden lg:table-cell text-center">
                  <Switch checked={bundle.isPublic} disabled />
                </TableCell>
                <TableCell className="hidden lg:table-cell text-center">
                  <Switch checked={bundle.isEnabled} disabled />
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button aria-label="More options"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDelete(bundle)
                        }}
                        className="text-red-500"
                        disabled={bundle.isSystem}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {/* Create Bundle Dialog */}
      <ResponsiveDialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen} variant="modal" size="md">
        <ResponsiveDialog.Header>
          <ResponsiveDialog.Title className="text-xl">Create Bundle Category</ResponsiveDialog.Title>
          <ResponsiveDialog.Description>
            Add a new bundle category for workspace templates
          </ResponsiveDialog.Description>
        </ResponsiveDialog.Header>

        <ResponsiveDialog.Body className="px-4 py-4 sm:px-6">
          <div className="space-y-5">
            {/* Bundle ID */}
            <div className="space-y-2">
              <Label htmlFor="new-bundleId" className="text-sm font-medium">
                Bundle ID <span className="text-red-500">*</span>
              </Label>
              <Input
                id="new-bundleId"
                value={newBundle.bundleId}
                onChange={(e) =>
                  setNewBundle({
                    ...newBundle,
                    bundleId: e.target.value.toLowerCase().replace(/\s+/g, "-"),
                  })
                }
                placeholder="my-bundle"
                className="font-mono h-10"
              />
              <p className="text-xs text-muted-foreground">
                Unique identifier, lowercase with hyphens
              </p>
            </div>

            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="new-name" className="text-sm font-medium">
                Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="new-name"
                value={newBundle.name}
                onChange={(e) =>
                  setNewBundle({ ...newBundle, name: e.target.value })
                }
                placeholder="My Bundle"
                className="h-10"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="new-description" className="text-sm font-medium">
                Description
              </Label>
              <Textarea
                id="new-description"
                value={newBundle.description}
                onChange={(e) =>
                  setNewBundle({ ...newBundle, description: e.target.value })
                }
                placeholder="Brief description"
                rows={2}
                className="resize-none"
              />
            </div>

            {/* Icon & Category */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Icon</Label>
                <IconPicker
                  icon={newBundle.icon}
                  color={newBundle.primaryColor}
                  onIconChange={(icon) => setNewBundle({ ...newBundle, icon })}
                  onColorChange={(color) => setNewBundle({ ...newBundle, primaryColor: color })}
                  showColor={false}
                  className="w-full"
                  trigger={
                    <Button variant="outline" className="w-full h-10 justify-start gap-2">
                      {(() => {
                        const IconComp = getIconComponent(newBundle.icon) || Package
                        return <IconComp className="h-4 w-4" style={{ color: newBundle.primaryColor }} />
                      })()}
                      <span>{newBundle.icon}</span>
                    </Button>
                  }
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Category</Label>
                <Select
                  value={newBundle.category}
                  onValueChange={(v) =>
                    setNewBundle({ ...newBundle, category: v as BundleCategory })
                  }
                >
                  <SelectTrigger className="h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {BUNDLE_CATEGORIES.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Primary Color */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Primary Color</Label>
              <ColorPickerSimple
                value={newBundle.primaryColor}
                onChange={(color) => setNewBundle({ ...newBundle, primaryColor: color })}
                placeholder="#6366f1"
              />
            </div>
          </div>
        </ResponsiveDialog.Body>

        <ResponsiveDialog.Footer>
          <div className="flex w-full gap-3">
            <Button
              variant="outline"
              onClick={() => setIsCreateDialogOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button aria-label="Add"
              onClick={handleCreateBundle}
              disabled={isSaving}
              className="flex-1"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Bundle
                </>
              )}
            </Button>
          </div>
        </ResponsiveDialog.Footer>
      </ResponsiveDialog>
    </div>
  )
}

export default BundleCategoriesTable
