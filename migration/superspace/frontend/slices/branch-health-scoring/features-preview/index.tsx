"use client"

import * as React from "react"
import { defineFeaturePreview } from "@/frontend/shared/preview"
import type { FeaturePreviewProps } from "@/frontend/shared/preview"

import { HealthStatsCards } from "../components/HealthStatsCards"
import { SnapshotList } from "../components/SnapshotList"
import type { BranchHealthSnapshot } from "../types"

const _id = (raw: string) => raw as unknown as BranchHealthSnapshot["_id"]
const _wsId = "ws_demo" as unknown as BranchHealthSnapshot["workspaceId"]
const NOW = Date.now()

const WEIGHTS = { revenue: 0.3, expense: 0.2, ops: 0.2, staff: 0.15, customer: 0.15 }

const MOCK_SNAPSHOTS: BranchHealthSnapshot[] = [
  {
    _id: _id("s_1"),
    workspaceId: _wsId,
    branchId: "main",
    capturedAt: NOW - 86_400_000 * 1,
    period: "2026-W17",
    revenueScore: 82,
    expenseScore: 76,
    opsScore: 88,
    staffScore: 90,
    customerScore: 84,
    compositeScore: 83.4,
    weights: WEIGHTS,
    insights: "Revenue up 12% vs last week; staff retention strong.",
    createdAt: NOW - 86_400_000 * 1,
  },
  {
    _id: _id("s_2"),
    workspaceId: _wsId,
    branchId: "south-bay",
    capturedAt: NOW - 86_400_000 * 2,
    period: "2026-W17",
    revenueScore: 64,
    expenseScore: 70,
    opsScore: 60,
    staffScore: 72,
    customerScore: 58,
    compositeScore: 64.1,
    weights: WEIGHTS,
    insights: "Customer satisfaction declining — investigate kitchen wait times.",
    createdAt: NOW - 86_400_000 * 2,
  },
  {
    _id: _id("s_3"),
    workspaceId: _wsId,
    branchId: "north",
    capturedAt: NOW - 86_400_000 * 3,
    period: "2026-W16",
    revenueScore: 92,
    expenseScore: 85,
    opsScore: 78,
    staffScore: 80,
    customerScore: 88,
    compositeScore: 84.8,
    weights: WEIGHTS,
    createdAt: NOW - 86_400_000 * 3,
  },
]

function BranchHealthPreview({ compact }: FeaturePreviewProps) {
  if (compact) {
    return (
      <div className="p-4 text-center">
        <h3 className="text-lg font-semibold">Branch Health Scoring</h3>
        <p className="mt-2 text-xs text-muted-foreground">
          {MOCK_SNAPSHOTS.length} branches scored this week
        </p>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col gap-4 overflow-auto p-4">
      <HealthStatsCards latestPerBranch={MOCK_SNAPSHOTS} />
      <SnapshotList items={MOCK_SNAPSHOTS} onSelect={() => { /* preview: no-op */ }} />
    </div>
  )
}

export default defineFeaturePreview({
  featureId: "branch-health-scoring",
  name: "Branch Health Scoring",
  description: "Composite weekly health snapshot per branch across 5 score categories.",
  component: BranchHealthPreview,
  category: "operations",
  tags: ["health", "scoring", "branches", "kpi"],
  mockDataSets: [
    {
      id: "default",
      name: "3-branch chain",
      description: "Main + south-bay + north branches with weekly scores and AI insights.",
      data: { snapshots: MOCK_SNAPSHOTS },
    },
  ],
})
