"use client"

import * as React from "react"
import { defineFeaturePreview } from "@/frontend/shared/preview"
import type { FeaturePreviewProps } from "@/frontend/shared/preview"

import { ReportStatsCards } from "../components/ReportStatsCards"
import { ReportList } from "../components/ReportList"
import type { DamageReport, DamageReportSummary } from "../types"

const _id = (raw: string) => raw as unknown as DamageReport["_id"]
const _wsId = "ws_demo" as unknown as DamageReport["workspaceId"]
const _userId = "user_demo" as unknown as DamageReport["reporterId"]
const NOW = Date.now()

const MOCK_REPORTS: DamageReport[] = [
  {
    _id: _id("r_1"), workspaceId: _wsId, branchId: "main",
    category: "Equipment", severity: "high",
    title: "Espresso machine leaking",
    description: "Water pooling under group head 2; operator switched to backup machine.",
    location: "Bar — Main Counter",
    reporterId: _userId, status: "investigating",
    costEstimate: 2_500_000,
    createdAt: NOW - 3_600_000 * 4, updatedAt: NOW - 3_600_000 * 1,
  },
  {
    _id: _id("r_2"), workspaceId: _wsId, branchId: "main",
    category: "Furniture", severity: "low",
    title: "Wobbly stool — bar 3",
    description: "Loose joint, harmless but unstable.",
    reporterId: _userId, status: "reported",
    costEstimate: 150_000,
    createdAt: NOW - 86_400_000 * 1, updatedAt: NOW - 86_400_000 * 1,
  },
  {
    _id: _id("r_3"), workspaceId: _wsId, branchId: "south-bay",
    category: "Plumbing", severity: "critical",
    title: "Sink drain blocked",
    description: "Backup in dishwashing area, halting service.",
    reporterId: _userId, assignedTo: _userId, status: "resolved",
    resolution: "repaired", resolvedBy: _userId, resolvedAt: NOW - 86_400_000 * 2,
    costEstimate: 800_000, actualCost: 1_100_000,
    createdAt: NOW - 86_400_000 * 3, updatedAt: NOW - 86_400_000 * 2,
  },
]

const MOCK_SUMMARY: DamageReportSummary = {
  open: MOCK_REPORTS.filter((r) => r.status !== "resolved" && r.status !== "written-off").length,
  critical: MOCK_REPORTS.filter((r) => r.severity === "critical").length,
  totalCost: MOCK_REPORTS.reduce((s, r) => s + (r.actualCost ?? r.costEstimate ?? 0), 0),
  total: MOCK_REPORTS.length,
}

function DamageReportsPreview({ compact }: FeaturePreviewProps) {
  if (compact) {
    return (
      <div className="p-4 text-center">
        <h3 className="text-lg font-semibold">Damage Reports</h3>
        <p className="mt-2 text-xs text-muted-foreground">
          {MOCK_SUMMARY.open} open · {MOCK_SUMMARY.critical} critical
        </p>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col gap-4 overflow-auto p-4">
      <ReportStatsCards summary={MOCK_SUMMARY} />
      <ReportList items={MOCK_REPORTS} onSelect={() => { /* preview: no-op */ }} />
    </div>
  )
}

export default defineFeaturePreview({
  featureId: "damage-reports",
  name: "Damage Reports",
  description: "Log, triage, and resolve equipment damage incidents.",
  component: DamageReportsPreview,
  category: "operations",
  tags: ["damage", "incidents", "maintenance", "triage"],
  mockDataSets: [
    {
      id: "default",
      name: "Mixed-severity queue",
      description: "Investigating, reported, and resolved incidents across two branches.",
      data: { reports: MOCK_REPORTS, summary: MOCK_SUMMARY },
    },
  ],
})
