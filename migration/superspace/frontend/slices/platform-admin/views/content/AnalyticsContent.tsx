"use client"

import React, { useMemo } from "react"
import {
  Building2,
  Store,
  Package,
  Blocks,
  Activity,
  TrendingUp,
  CheckCircle2,
  Clock,
  Globe,
  EyeOff,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { usePlatformAdmin, useSystemFeatures, useBundleCategories } from "../../hooks/usePlatformAdmin"
import { StatCard } from "../../components/cards/StatCard"
import type { FeatureStatus } from "../../types"

const STATUS_COLORS: Record<FeatureStatus, string> = {
  stable: "bg-green-500/10 text-green-600 border-green-500/20",
  beta: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  development: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  experimental: "bg-purple-500/10 text-purple-600 border-purple-500/20",
  deprecated: "bg-gray-500/10 text-gray-500 border-gray-500/20",
  disabled: "bg-red-500/10 text-red-500 border-red-500/20",
}

function formatRelativeTime(timestamp: number): string {
  const diff = Date.now() - timestamp
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return "just now"
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  return `${days}d ago`
}

function LoadingSkeleton() {
  return (
    <div className="p-6 space-y-6">
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-lg" />
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Skeleton className="h-64 w-full rounded-lg" />
        <Skeleton className="h-64 w-full rounded-lg" />
      </div>
    </div>
  )
}

/**
 * AnalyticsContent — Platform-wide analytics dashboard
 * Uses existing hooks to display real data: workspace metrics,
 * feature distribution by status/category, and recent updates.
 */
export function AnalyticsContent() {
  const { isPlatformAdmin, isLoading: statusLoading, workspaces } = usePlatformAdmin()
  const { features: systemFeatures, isLoading: featuresLoading } = useSystemFeatures()
  const { bundles: bundleCategories, isLoading: bundlesLoading } = useBundleCategories()

  const isLoading = statusLoading || featuresLoading || bundlesLoading

  // Derived stats
  const stats = useMemo(() => {
    const activeWorkspaces = workspaces.filter(
      (w: any) => !w.isArchived && !w.isDeleted
    ).length

    const publicFeatures = systemFeatures.filter((f: any) => f.isPublic).length
    const enabledFeatures = systemFeatures.filter((f: any) => f.isEnabled).length
    const readyFeatures = systemFeatures.filter((f: any) => f.isReady).length

    return {
      totalWorkspaces: workspaces.length,
      activeWorkspaces,
      totalFeatures: systemFeatures.length,
      publicFeatures,
      enabledFeatures,
      readyFeatures,
      totalBundles: bundleCategories.length,
    }
  }, [workspaces, systemFeatures, bundleCategories])

  // Feature distribution by status
  const byStatus = useMemo(() => {
    const grouped: Partial<Record<FeatureStatus, number>> = {}
    for (const f of systemFeatures) {
      const s = (f as any).status as FeatureStatus
      grouped[s] = (grouped[s] ?? 0) + 1
    }
    return Object.entries(grouped)
      .sort(([, a], [, b]) => b - a)
      .map(([status, count]) => ({ status: status as FeatureStatus, count }))
  }, [systemFeatures])

  // Feature distribution by category
  const byCategory = useMemo(() => {
    const grouped: Record<string, number> = {}
    for (const f of systemFeatures) {
      const cat = (f as any).category || "uncategorized"
      grouped[cat] = (grouped[cat] ?? 0) + 1
    }
    return Object.entries(grouped)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 8)
      .map(([category, count]) => ({ category, count }))
  }, [systemFeatures])

  // Workspace distribution by type
  const byWorkspaceType = useMemo(() => {
    const grouped: Record<string, number> = {}
    for (const w of workspaces) {
      const type = (w as any).type || "workspace"
      grouped[type] = (grouped[type] ?? 0) + 1
    }
    return Object.entries(grouped)
      .sort(([, a], [, b]) => b - a)
      .map(([type, count]) => ({ type, count }))
  }, [workspaces])

  // Recently updated features (proxy for "recent activity")
  const recentFeatureUpdates = useMemo(() => {
    return [...systemFeatures]
      .sort((a: any, b: any) => (b.updatedAt ?? b._creationTime ?? 0) - (a.updatedAt ?? a._creationTime ?? 0))
      .slice(0, 10)
  }, [systemFeatures])

  if (isLoading) return <LoadingSkeleton />

  return (
    <ScrollArea className="h-full">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-lg font-semibold">Platform Analytics</h2>
          <p className="text-sm text-muted-foreground">
            System-wide metrics — updated in real time
          </p>
        </div>

        {/* Stats Row */}
        <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Workspaces"
            value={stats.totalWorkspaces}
            description={`${stats.activeWorkspaces} active`}
            icon={Building2}
          />
          <StatCard
            title="System Features"
            value={stats.totalFeatures}
            description={`${stats.publicFeatures} in Menu Store`}
            icon={Store}
          />
          <StatCard
            title="Feature Bundles"
            value={stats.totalBundles}
            description="Available bundles"
            icon={Package}
          />
          <StatCard
            title="Ready Features"
            value={stats.readyFeatures}
            description={`${stats.enabledFeatures} enabled`}
            icon={CheckCircle2}
          />
        </div>

        {/* Distribution Cards */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* By Status */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Activity className="h-4 w-4 text-muted-foreground" />
                Features by Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {byStatus.length === 0 ? (
                <p className="text-sm text-muted-foreground">No features yet</p>
              ) : (
                byStatus.map(({ status, count }) => (
                  <div key={status} className="flex items-center justify-between">
                    <Badge
                      variant="outline"
                      className={`text-xs capitalize ${STATUS_COLORS[status] ?? ""}`}
                    >
                      {status}
                    </Badge>
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 rounded-full bg-muted overflow-hidden w-24">
                        <div
                          className="h-full bg-primary/60 rounded-full"
                          style={{
                            width: `${Math.round((count / stats.totalFeatures) * 100)}%`,
                          }}
                        />
                      </div>
                      <span className="text-sm font-medium w-6 text-right">{count}</span>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* By Category */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Blocks className="h-4 w-4 text-muted-foreground" />
                Features by Category
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {byCategory.length === 0 ? (
                <p className="text-sm text-muted-foreground">No features yet</p>
              ) : (
                byCategory.map(({ category, count }) => (
                  <div key={category} className="flex items-center justify-between">
                    <span className="text-xs capitalize text-muted-foreground">{category}</span>
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 rounded-full bg-muted overflow-hidden w-24">
                        <div
                          className="h-full bg-primary/40 rounded-full"
                          style={{
                            width: `${Math.round((count / stats.totalFeatures) * 100)}%`,
                          }}
                        />
                      </div>
                      <span className="text-sm font-medium w-6 text-right">{count}</span>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Workspace & Visibility */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Workspace by type */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                Workspaces by Type
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {byWorkspaceType.length === 0 ? (
                <p className="text-sm text-muted-foreground">No workspaces yet</p>
              ) : (
                byWorkspaceType.map(({ type, count }) => (
                  <div key={type} className="flex items-center justify-between">
                    <Badge variant="secondary" className="text-xs capitalize">{type}</Badge>
                    <span className="text-sm font-medium">{count}</span>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Feature visibility summary */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                Feature Visibility
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Public (in Menu Store)</span>
                </div>
                <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">
                  {stats.publicFeatures}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Hidden</span>
                </div>
                <Badge variant="outline">
                  {stats.totalFeatures - stats.publicFeatures}
                </Badge>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-blue-500" />
                  <span className="text-sm">Enabled</span>
                </div>
                <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/20">
                  {stats.enabledFeatures}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-purple-500" />
                  <span className="text-sm">Production Ready</span>
                </div>
                <Badge variant="outline" className="bg-purple-500/10 text-purple-600 border-purple-500/20">
                  {stats.readyFeatures}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Feature Updates */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              Recent Feature Updates
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentFeatureUpdates.length === 0 ? (
              <p className="text-sm text-muted-foreground">No recent updates</p>
            ) : (
              <div className="space-y-2">
                {recentFeatureUpdates.map((f: any) => (
                  <div
                    key={f._id}
                    className="flex items-center justify-between py-1.5 border-b last:border-0"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <Badge
                        variant="outline"
                        className={`text-xs flex-shrink-0 capitalize ${STATUS_COLORS[f.status as FeatureStatus] ?? ""}`}
                      >
                        {f.status}
                      </Badge>
                      <span className="text-sm truncate">{f.name}</span>
                    </div>
                    <span className="text-xs text-muted-foreground flex-shrink-0 ml-2">
                      {formatRelativeTime(f.updatedAt ?? f._creationTime ?? Date.now())}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </ScrollArea>
  )
}
