"use client"

import React, { useState, useMemo } from "react"
import {
  Search,
  Filter,
  Download,
  Plus,
  Loader2,
  X,
  ChevronDown,
  MoreHorizontal,
  Edit2,
  Copy,
  Trash2,
  Eye,
  EyeOff,
  Store,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Zap,
  Settings,
  Box,
} from "lucide-react"
import { useSystemFeatures, useSystemFeatureMutations, useBundleCategories } from "../../hooks/usePlatformAdmin"
import { useTableSortAndFilter, ColumnDef } from "../../hooks/useTableSortAndFilter"
import { EnhancedTableHeader } from "../../components/EnhancedTableHeader"
import type { FeatureStatus } from "../../types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import { Skeleton } from "@/components/ui/skeleton"
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { getIconComponent } from "@/frontend/shared/ui/icons"

// Feature statuses
const FEATURE_STATUSES = [
  { value: "stable", label: "Stable", color: "bg-green-500/10 text-green-500 border-green-500/20" },
  { value: "beta", label: "Beta", color: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" },
  { value: "development", label: "Development", color: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
  { value: "experimental", label: "Experimental", color: "bg-purple-500/10 text-purple-500 border-purple-500/20" },
  { value: "deprecated", label: "Deprecated", color: "bg-gray-500/10 text-gray-500 border-gray-500/20" },
] as const

function StatusBadge({ status }: { status: FeatureStatus }) {
  const statusConfig: Record<FeatureStatus, { icon: React.ElementType; class: string }> = {
    stable: { icon: CheckCircle2, class: "bg-green-500/10 text-green-500 border-green-500/20" },
    beta: { icon: AlertTriangle, class: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" },
    development: { icon: Settings, class: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
    experimental: { icon: Zap, class: "bg-purple-500/10 text-purple-500 border-purple-500/20" },
    deprecated: { icon: XCircle, class: "bg-gray-500/10 text-gray-500 border-gray-500/20" },
    disabled: { icon: XCircle, class: "bg-red-500/10 text-red-500 border-red-500/20" },
  }

  const config = statusConfig[status] || statusConfig.stable
  const Icon = config.icon

  return (
    <Badge variant="outline" className={cn("gap-1", config.class)}>
      <Icon className="h-3 w-3" />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  )
}

interface SystemFeaturesContentProps {
  onItemSelect: (item: any) => void
  selectedItemId?: string
}

export function SystemFeaturesContent({ onItemSelect, selectedItemId }: SystemFeaturesContentProps) {
  const { features, isLoading } = useSystemFeatures()
  const { setVisibility, deleteFeature, seedFeatures } = useSystemFeatureMutations()

  // Define columns for sorting and filtering
  const columns: ColumnDef<any>[] = [
    { key: "name", label: "Feature", sortable: true, filterable: true },
    { key: "featureId", label: "Feature ID", sortable: true, filterable: true },
    { key: "version", label: "Version", sortable: true, filterable: false },
    { key: "category", label: "Category", sortable: true, filterable: true },
    { key: "status", label: "Status", sortable: true, filterable: true },
    { key: "featureType", label: "Type", sortable: true, filterable: true },
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
    processedData: filteredFeatures,
  } = useTableSortAndFilter({
    data: features,
    columns,
    initialFilters: { category: null, status: null },
  })

  const [isSeeding, setIsSeeding] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [togglingIds, setTogglingIds] = useState<Set<string>>(new Set())

  // Get unique categories from features
  const categories = useMemo(() => {
    const cats = new Set<string>(features.map((f: any) => String(f.category)))
    return Array.from(cats).filter(Boolean)
  }, [features])

  const handleVisibilityToggle = async (feature: any) => {
    const featureId = feature._id
    setTogglingIds(prev => new Set(prev).add(featureId))
    try {
      await setVisibility(feature._id, !feature.isPublic, feature.isEnabled)
      toast.success(
        !feature.isPublic
          ? `"${feature.name}" now visible in Menu Store`
          : `"${feature.name}" hidden from Menu Store`
      )
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error)
      toast.error(msg || "Failed to update Menu Store visibility")
    } finally {
      setTogglingIds(prev => {
        const next = new Set(prev)
        next.delete(featureId)
        return next
      })
    }
  }

  const handleEnabledToggle = async (feature: any) => {
    const featureId = feature._id
    setTogglingIds(prev => new Set(prev).add(featureId))
    try {
      await setVisibility(feature._id, feature.isPublic, !feature.isEnabled)
      toast.success(
        !feature.isEnabled
          ? `"${feature.name}" is now enabled`
          : `"${feature.name}" is now disabled`
      )
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error)
      toast.error(msg || "Failed to update feature status")
    } finally {
      setTogglingIds(prev => {
        const next = new Set(prev)
        next.delete(featureId)
        return next
      })
    }
  }

  const handleDelete = async (featureId: any) => {
    if (!confirm("Are you sure you want to delete this feature?")) return
    try {
      await deleteFeature(featureId)
      toast.success("Feature deleted")
    } catch (error) {
      toast.error("Failed to delete feature")
    }
  }

  const handleSeedFeatures = async () => {
    setIsSeeding(true)
    try {
      const result = await seedFeatures()
      toast.success(`Seeded ${result.created} features, ${result.skipped} skipped`)
    } catch (error) {
      toast.error("Failed to seed features")
    } finally {
      setIsSeeding(false)
    }
  }

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredFeatures.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(filteredFeatures.map((f: any) => f._id)))
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
      <div className="space-y-2 p-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full" />
        ))}
      </div>
    )
  }

  if (features.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Store className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>No system features configured yet.</p>
        <p className="text-sm mb-4">Seed features from the catalog to populate Menu Store.</p>
        <Button aria-label="Download" onClick={handleSeedFeatures} disabled={isSeeding}>
          {isSeeding ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Seeding...
            </>
          ) : (
            <>
              <Download className="h-4 w-4 mr-2" />
              Seed from Catalog
            </>
          )}
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex-shrink-0 p-4 border-b space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* Search */}
          <div className="relative flex-1 min-w-full sm:min-w-[200px]">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search features..."
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
            <SelectTrigger className="w-full sm:w-[150px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Status Filter */}
          <Select
            value={filters.status || "all"}
            onValueChange={(v) => handleFilter("status", v === "all" ? null : v)}
          >
            <SelectTrigger className="w-full sm:w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              {FEATURE_STATUSES.map((s) => (
                <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
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
              onClick={handleSeedFeatures}
              disabled={isSeeding}
            >
              {isSeeding ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              Sync
            </Button>

            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              New Feature
            </Button>
          </div>
        </div>

        {/* Results count */}
        <div className="text-sm text-muted-foreground">
          Showing {filteredFeatures.length} of {features.length} features
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 min-h-0 overflow-auto">
        <Table>
          <TableHeader className="sticky top-0 bg-background z-10">
            <TableRow>
              <TableHead className="w-[40px]">
                <Checkbox
                  checked={selectedIds.size === filteredFeatures.length && filteredFeatures.length > 0}
                  onCheckedChange={toggleSelectAll}
                />
              </TableHead>
              <EnhancedTableHeader
                sortable={true}
                sortDirection={sortConfig.key === "name" ? sortConfig.direction : null}
                isActive={sortConfig.key === "name"}
                onSort={() => handleSort("name")}
              >
                Feature
              </EnhancedTableHeader>
              <EnhancedTableHeader
                sortable={true}
                sortDirection={sortConfig.key === "category" ? sortConfig.direction : null}
                isActive={sortConfig.key === "category"}
                onSort={() => handleSort("category")}
                className="w-[120px]"
              >
                Category
              </EnhancedTableHeader>
              <EnhancedTableHeader
                sortable={true}
                sortDirection={sortConfig.key === "status" ? sortConfig.direction : null}
                isActive={sortConfig.key === "status"}
                onSort={() => handleSort("status")}
                className="w-[120px]"
              >
                Status
              </EnhancedTableHeader>
              <TableHead className="w-[80px] text-center">Store</TableHead>
              <TableHead className="w-[70px] text-center">Enabled</TableHead>
              <TableHead className="w-[60px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredFeatures.map((feature: any) => {
              const isSelected = selectedItemId === feature._id
              const IconComponent = feature.icon ? getIconComponent(feature.icon) : Box

              return (
                <TableRow
                  key={feature._id}
                  className={cn(
                    "cursor-pointer transition-colors",
                    !feature.isEnabled && "opacity-50",
                    selectedIds.has(feature._id) && "bg-muted/50",
                    isSelected && "bg-primary/5 border-l-2 border-l-primary"
                  )}
                  onClick={() => onItemSelect(feature)}
                >
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={selectedIds.has(feature._id)}
                      onCheckedChange={() => toggleSelect(feature._id)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="rounded-md bg-muted p-1.5 flex-shrink-0">
                        {IconComponent && <IconComponent className="h-4 w-4" />}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium truncate">{feature.name}</span>
                          {!feature.isReady && (
                            <Badge variant="outline" className="text-xs bg-orange-500/10 text-orange-500 border-orange-500/20 flex-shrink-0">
                              In Development
                            </Badge>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground font-mono truncate">{feature.featureId}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="capitalize">{feature.category}</Badge>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={feature.status as FeatureStatus} />
                  </TableCell>
                  <TableCell className="text-center" onClick={(e) => e.stopPropagation()}>
                    <div className="flex justify-center">
                      {togglingIds.has(feature._id) ? (
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                      ) : (
                        <Switch
                          checked={feature.isPublic}
                          onCheckedChange={() => handleVisibilityToggle(feature)}
                          disabled={togglingIds.has(feature._id)}
                        />
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-center" onClick={(e) => e.stopPropagation()}>
                    <div className="flex justify-center">
                      {togglingIds.has(feature._id) ? (
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                      ) : (
                        <Switch
                          checked={feature.isEnabled}
                          onCheckedChange={() => handleEnabledToggle(feature)}
                          disabled={togglingIds.has(feature._id)}
                        />
                      )}
                    </div>
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button aria-label="More options" variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onItemSelect(feature)}>
                          <Edit2 className="h-4 w-4 mr-2" />
                          Edit Feature
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => {
                          navigator.clipboard.writeText(feature.featureId)
                          toast.success("Feature ID copied")
                        }}>
                          <Copy className="h-4 w-4 mr-2" />
                          Copy ID
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleDelete(feature._id)}
                          className="text-red-500"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
