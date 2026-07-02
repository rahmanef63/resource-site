"use client"

import React, { useMemo, useState } from "react"
import { Package } from "lucide-react"
import type { Id } from "@convex/_generated/dataModel"
import { FeatureShell } from "@/frontend/shared/ui/layout/feature-shell"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useAssetDetail, useAssetManagement } from "../hooks/useAssetManagement"
import { AssetStatsCards } from "../components/AssetStatsCards"
import { AssetList } from "../components/AssetList"
import { AssetCreateDialog } from "../components/AssetCreateDialog"
import { AssetDetailDrawer } from "../components/AssetDetailDrawer"
import type { AssetStatus, ManagedAsset } from "../types"

interface AssetManagementPageProps {
  workspaceId?: Id<"workspaces"> | null
}

const ALL_CATEGORIES = "__all__"

export default function AssetManagementPage({ workspaceId }: AssetManagementPageProps) {
  const [statusFilter, setStatusFilter] = useState<AssetStatus | "all">("all")
  const [categoryFilter, setCategoryFilter] = useState<string>(ALL_CATEGORIES)
  const [selectedId, setSelectedId] = useState<Id<"managedAssets"> | null>(null)

  const { items, summary, isLoading, registerAsset, transferAsset, retireAsset } =
    useAssetManagement(workspaceId, {
      status: statusFilter,
      category: categoryFilter === ALL_CATEGORIES ? undefined : categoryFilter,
    })

  const selected = useAssetDetail(workspaceId, selectedId)

  const categories = useMemo(() => {
    const set = new Set<string>()
    for (const a of items) {
      if (a.category) set.add(a.category)
    }
    return Array.from(set).sort()
  }, [items])

  const handleSelect = (row: ManagedAsset) => setSelectedId(row._id)

  if (!workspaceId) {
    return (
      <FeatureShell featureId="asset-management" padding centered>
        <div className="text-center">
          <Package className="mx-auto h-10 w-10 text-muted-foreground" />
          <h2 className="mt-4 text-lg font-semibold">No workspace selected</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Select a workspace to track managed assets.
          </p>
        </div>
      </FeatureShell>
    )
  }

  return (
    <FeatureShell
      featureId="asset-management"
      padding
      maxWidth="full"
      aiPlaceholder="Ask about assets, transfers, depreciation, retirement…"
      inspector={
        selectedId ? (
          <AssetDetailDrawer
            asset={selected}
            onClose={() => setSelectedId(null)}
            onTransfer={async (id, input) => {
              await transferAsset(id, input)
            }}
            onRetire={async (id, input) => {
              await retireAsset(id, input)
            }}
          />
        ) : undefined
      }
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="flex items-center gap-2 text-xl font-semibold">
              <Package className="h-5 w-5" />
              Asset Management
            </h1>
            <p className="text-sm text-muted-foreground">
              Fixed assets with location, assignment, depreciation, and full transaction ledger.
            </p>
          </div>
          <AssetCreateDialog onCreate={registerAsset} />
        </div>

        <AssetStatsCards summary={summary} />

        <div className="flex flex-wrap items-center gap-3">
          <Tabs
            value={statusFilter}
            onValueChange={(v) => setStatusFilter(v as AssetStatus | "all")}
            className="min-w-0"
          >
            <TabsList className="inline-flex flex-wrap">
              <TabsTrigger value="all">All ({summary?.total ?? 0})</TabsTrigger>
              <TabsTrigger value="active">
                Active ({summary?.active ?? 0})
              </TabsTrigger>
              <TabsTrigger value="maintenance">
                Maintenance ({summary?.maintenance ?? 0})
              </TabsTrigger>
              <TabsTrigger value="retired">
                Retired ({summary?.retired ?? 0})
              </TabsTrigger>
              <TabsTrigger value="lost">Lost</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="ml-auto flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Category</span>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="h-9 w-[180px]">
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_CATEGORIES}>All categories</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
            Loading assets…
          </div>
        ) : (
          <AssetList
            items={items}
            onSelect={handleSelect}
            emptyAction={<AssetCreateDialog onCreate={registerAsset} />}
          />
        )}
      </div>
    </FeatureShell>
  )
}
