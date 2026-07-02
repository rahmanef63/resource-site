"use client"

import * as React from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { defineFeaturePreview } from "@/frontend/shared/preview"
import type { FeaturePreviewProps } from "@/frontend/shared/preview"

import { KpiStatsCards } from "../components/KpiStatsCards"
import { ThresholdList } from "../components/ThresholdList"
import { AlertList } from "../components/AlertList"
import type { KpiAlert, KpiSummary, KpiThreshold } from "../types"

const _id = (raw: string) => raw as unknown as KpiThreshold["_id"]
const _alertId = (raw: string) => raw as unknown as KpiAlert["_id"]
const _wsId = "ws_demo" as unknown as KpiThreshold["workspaceId"]
const _userId = "user_demo" as unknown as KpiThreshold["createdBy"]

const NOW = Date.now()

const MOCK_THRESHOLDS: KpiThreshold[] = [
  {
    _id: _id("th_1"),
    workspaceId: _wsId,
    branchId: "main",
    kpiKey: "ticket_response_time",
    metric: "Avg ticket response (min)",
    direction: "above",
    value1: 30,
    severity: "warning",
    actionPolicy: ["notify", "email"],
    isActive: true,
    createdBy: _userId,
    createdAt: NOW - 86_400_000 * 7,
    updatedAt: NOW - 86_400_000 * 2,
  },
  {
    _id: _id("th_2"),
    workspaceId: _wsId,
    branchId: "main",
    kpiKey: "uptime",
    metric: "Uptime %",
    direction: "below",
    value1: 99.5,
    severity: "critical",
    actionPolicy: ["notify", "email", "trigger-workflow"],
    isActive: true,
    createdBy: _userId,
    createdAt: NOW - 86_400_000 * 14,
    updatedAt: NOW - 86_400_000,
  },
  {
    _id: _id("th_3"),
    workspaceId: _wsId,
    kpiKey: "daily_signups",
    metric: "Daily signups",
    direction: "outside-range",
    value1: 50,
    value2: 500,
    severity: "info",
    actionPolicy: ["notify"],
    isActive: false,
    createdBy: _userId,
    createdAt: NOW - 86_400_000 * 30,
    updatedAt: NOW - 86_400_000 * 30,
  },
]

const MOCK_ALERTS: KpiAlert[] = [
  {
    _id: _alertId("al_1"),
    workspaceId: _wsId,
    thresholdId: MOCK_THRESHOLDS[0]._id,
    branchId: "main",
    triggeredAt: NOW - 3_600_000,
    actualValue: 47,
    severity: "warning",
    resolved: false,
  },
  {
    _id: _alertId("al_2"),
    workspaceId: _wsId,
    thresholdId: MOCK_THRESHOLDS[1]._id,
    branchId: "main",
    triggeredAt: NOW - 1_800_000,
    actualValue: 98.7,
    severity: "critical",
    resolved: false,
  },
  {
    _id: _alertId("al_3"),
    workspaceId: _wsId,
    thresholdId: MOCK_THRESHOLDS[0]._id,
    triggeredAt: NOW - 86_400_000 * 2,
    actualValue: 35,
    severity: "warning",
    resolved: true,
    resolvedAt: NOW - 86_400_000,
    resolutionNote: "Cleared after auto-scale event",
  },
]

const MOCK_SUMMARY: KpiSummary = {
  activeThresholds: MOCK_THRESHOLDS.filter((t) => t.isActive).length,
  openAlerts: MOCK_ALERTS.filter((a) => !a.resolved).length,
  criticalAlerts: MOCK_ALERTS.filter((a) => !a.resolved && a.severity === "critical").length,
  totalAlerts: MOCK_ALERTS.length,
}

function KpiThresholdsPreview({ compact }: FeaturePreviewProps) {
  if (compact) {
    return (
      <div className="p-4 text-center">
        <h3 className="text-lg font-semibold">KPI Thresholds</h3>
        <p className="mt-2 text-xs text-muted-foreground">
          {MOCK_SUMMARY.openAlerts} open alerts · {MOCK_SUMMARY.activeThresholds} thresholds
        </p>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col gap-4 overflow-auto p-4">
      <KpiStatsCards summary={MOCK_SUMMARY} />
      <Tabs defaultValue="alerts" className="flex flex-1 flex-col">
        <TabsList className="flex w-full self-start justify-evenly">
          <TabsTrigger value="alerts">Alerts ({MOCK_SUMMARY.openAlerts})</TabsTrigger>
          <TabsTrigger value="thresholds">Thresholds ({MOCK_THRESHOLDS.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="alerts" className="mt-4">
          <AlertList
            items={MOCK_ALERTS.filter((a) => !a.resolved)}
            thresholds={MOCK_THRESHOLDS}
            onSelect={() => { /* preview: no-op */ }}
            emptyHint="Nothing to triage — all KPIs are within defined thresholds."
          />
        </TabsContent>
        <TabsContent value="thresholds" className="mt-4">
          <ThresholdList
            items={MOCK_THRESHOLDS}
            onSelect={() => { /* preview: no-op */ }}
            onToggle={async () => { /* preview: no-op */ }}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default defineFeaturePreview({
  featureId: "kpi-thresholds",
  name: "KPI Thresholds",
  description: "Define metric thresholds and triage open alerts in one place.",
  component: KpiThresholdsPreview,
  category: "operations",
  tags: ["kpi", "alerts", "monitoring", "thresholds"],
  mockDataSets: [
    {
      id: "default",
      name: "Active monitoring",
      description: "Two active thresholds with a critical and a warning alert open.",
      data: { thresholds: MOCK_THRESHOLDS, alerts: MOCK_ALERTS, summary: MOCK_SUMMARY },
    },
  ],
})
