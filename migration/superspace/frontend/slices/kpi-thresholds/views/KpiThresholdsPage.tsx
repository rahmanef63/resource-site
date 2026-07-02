"use client"

import React, { useMemo, useState } from "react"
import { Gauge } from "lucide-react"
import type { Id } from "@convex/_generated/dataModel"
import { FeatureShell } from "@/frontend/shared/ui/layout/feature-shell"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useKpiThresholds } from "../hooks/useKpiThresholds"
import { KpiStatsCards } from "../components/KpiStatsCards"
import { ThresholdList } from "../components/ThresholdList"
import { AlertList } from "../components/AlertList"
import { ThresholdCreateDialog } from "../components/ThresholdCreateDialog"
import { ThresholdDetailDrawer } from "../components/ThresholdDetailDrawer"
import { AlertDetailDrawer } from "../components/AlertDetailDrawer"
import type { KpiAlert, KpiThreshold, Severity } from "../types"
import { SEVERITIES, SEVERITY_LABELS } from "../types"

type TopTab = "thresholds" | "alerts"
type ThresholdFilter = "all" | "active" | "paused"
type AlertSeverityFilter = "all" | Severity

interface KpiThresholdsPageProps {
  workspaceId?: Id<"workspaces"> | null
}

export default function KpiThresholdsPage({ workspaceId }: KpiThresholdsPageProps) {
  const {
    thresholds,
    alerts,
    summary,
    isLoading,
    defineThreshold,
    toggleThreshold,
    acknowledgeAlert,
  } = useKpiThresholds(workspaceId)

  const [topTab, setTopTab] = useState<TopTab>("thresholds")

  // Thresholds tab state
  const [thresholdFilter, setThresholdFilter] = useState<ThresholdFilter>("all")
  const [selectedThreshold, setSelectedThreshold] = useState<KpiThreshold | null>(null)

  // Alerts tab state
  const [showResolved, setShowResolved] = useState(false)
  const [severityFilter, setSeverityFilter] = useState<AlertSeverityFilter>("all")
  const [selectedAlert, setSelectedAlert] = useState<KpiAlert | null>(null)

  const filteredThresholds = useMemo(() => {
    if (thresholdFilter === "all") return thresholds
    if (thresholdFilter === "active") return thresholds.filter((t) => t.isActive)
    return thresholds.filter((t) => !t.isActive)
  }, [thresholds, thresholdFilter])

  const filteredAlerts = useMemo(() => {
    return alerts.filter((a) => {
      if (!showResolved && a.resolved) return false
      if (severityFilter !== "all" && a.severity !== severityFilter) return false
      return true
    })
  }, [alerts, showResolved, severityFilter])

  const activeCount = useMemo(() => thresholds.filter((t) => t.isActive).length, [thresholds])
  const pausedCount = thresholds.length - activeCount
  const openAlertCount = useMemo(() => alerts.filter((a) => !a.resolved).length, [alerts])
  const resolvedAlertCount = alerts.length - openAlertCount

  if (!workspaceId) {
    return (
      <FeatureShell featureId="kpi-thresholds" padding centered>
        <div className="text-center">
          <Gauge className="mx-auto h-10 w-10 text-muted-foreground" />
          <h2 className="mt-4 text-lg font-semibold">No workspace selected</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Select a workspace to define KPI thresholds and triage alerts.
          </p>
        </div>
      </FeatureShell>
    )
  }

  const refreshSelectedThreshold = (id: Id<"kpiThresholds">) => {
    const updated = thresholds.find((t) => t._id === id)
    setSelectedThreshold(updated ?? null)
  }

  const refreshSelectedAlert = (id: Id<"kpiAlerts">) => {
    const updated = alerts.find((a) => a._id === id)
    setSelectedAlert(updated ?? null)
  }

  const selectedThresholdForAlert = selectedAlert
    ? thresholds.find((t) => String(t._id) === String(selectedAlert.thresholdId)) ?? null
    : null

  const inspector =
    topTab === "thresholds" && selectedThreshold ? (
      <ThresholdDetailDrawer
        threshold={selectedThreshold}
        onClose={() => setSelectedThreshold(null)}
        onToggle={async (id, isActive) => {
          await toggleThreshold(id, isActive)
          refreshSelectedThreshold(id)
        }}
      />
    ) : topTab === "alerts" && selectedAlert ? (
      <AlertDetailDrawer
        alert={selectedAlert}
        threshold={selectedThresholdForAlert}
        onClose={() => setSelectedAlert(null)}
        onAcknowledge={async (id, input) => {
          await acknowledgeAlert(id, input)
          refreshSelectedAlert(id)
        }}
      />
    ) : undefined

  return (
    <FeatureShell
      featureId="kpi-thresholds"
      padding
      maxWidth="full"
      aiPlaceholder="Ask about KPI thresholds, open alerts, critical breaches…"
      inspector={inspector}
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="flex items-center gap-2 text-xl font-semibold">
              <Gauge className="h-5 w-5" />
              KPI Thresholds
            </h1>
            <p className="text-sm text-muted-foreground">
              Define KPI alert thresholds and triage triggered alerts across branches.
            </p>
          </div>
          <ThresholdCreateDialog onCreate={defineThreshold} />
        </div>

        <KpiStatsCards summary={summary} />

        <Tabs value={topTab} onValueChange={(v) => setTopTab(v as TopTab)}>
          <TabsList className="inline-flex flex-wrap">
            <TabsTrigger value="thresholds">
              Thresholds ({thresholds.length})
            </TabsTrigger>
            <TabsTrigger value="alerts">Alerts ({openAlertCount})</TabsTrigger>
          </TabsList>

          <TabsContent value="thresholds" className="mt-4 flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <Tabs
                value={thresholdFilter}
                onValueChange={(v) => setThresholdFilter(v as ThresholdFilter)}
              >
                <TabsList className="inline-flex flex-wrap">
                  <TabsTrigger value="all">All ({thresholds.length})</TabsTrigger>
                  <TabsTrigger value="active">Active ({activeCount})</TabsTrigger>
                  <TabsTrigger value="paused">Paused ({pausedCount})</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
                Loading thresholds…
              </div>
            ) : (
              <ThresholdList
                items={filteredThresholds}
                onSelect={setSelectedThreshold}
                onToggle={toggleThreshold}
                emptyAction={<ThresholdCreateDialog onCreate={defineThreshold} />}
              />
            )}
          </TabsContent>

          <TabsContent value="alerts" className="mt-4 flex flex-col gap-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Label className="text-xs text-muted-foreground" htmlFor="severity-filter">
                  Severity
                </Label>
                <Select
                  value={severityFilter}
                  onValueChange={(v) => setSeverityFilter(v as AlertSeverityFilter)}
                >
                  <SelectTrigger id="severity-filter" className="h-8 w-[160px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All severities</SelectItem>
                    {SEVERITIES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {SEVERITY_LABELS[s]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <Switch
                  checked={showResolved}
                  onCheckedChange={setShowResolved}
                  aria-label="Show resolved alerts"
                />
                <span className="text-muted-foreground">
                  Show resolved ({resolvedAlertCount})
                </span>
              </label>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
                Loading alerts…
              </div>
            ) : (
              <AlertList
                items={filteredAlerts}
                thresholds={thresholds}
                onSelect={setSelectedAlert}
                emptyHint={
                  showResolved
                    ? "No alerts match the current filter."
                    : "No open alerts — switch to 'Show resolved' to see historical alerts."
                }
              />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </FeatureShell>
  )
}
