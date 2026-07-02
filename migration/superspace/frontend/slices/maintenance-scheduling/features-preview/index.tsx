"use client"

import * as React from "react"
import { defineFeaturePreview } from "@/frontend/shared/preview"
import type { FeaturePreviewProps } from "@/frontend/shared/preview"

import { TaskStatsCards } from "../components/TaskStatsCards"
import { TaskList } from "../components/TaskList"
import type { MaintenanceSummary, MaintenanceTask } from "../types"

const _id = (raw: string) => raw as unknown as MaintenanceTask["_id"]
const _wsId = "ws_demo" as unknown as MaintenanceTask["workspaceId"]
const NOW = Date.now()

const MOCK_TASKS: MaintenanceTask[] = [
  {
    _id: _id("mt_1"), workspaceId: _wsId, branchId: "main",
    title: "Espresso machine — weekly descale",
    type: "preventive", frequency: "weekly",
    nextDueAt: NOW + 86_400_000 * 2,
    status: "scheduled",
    estimatedCost: 150_000,
    createdAt: NOW - 86_400_000 * 90, updatedAt: NOW - 86_400_000 * 7,
  },
  {
    _id: _id("mt_2"), workspaceId: _wsId, branchId: "main",
    title: "Walk-in fridge gasket replacement",
    description: "Door seal cracked — schedule before peak hours.",
    type: "reactive", frequency: "once",
    nextDueAt: NOW - 86_400_000,
    status: "overdue",
    estimatedCost: 1_200_000,
    createdAt: NOW - 86_400_000 * 5, updatedAt: NOW - 86_400_000 * 1,
  },
  {
    _id: _id("mt_3"), workspaceId: _wsId, branchId: "south-bay",
    title: "Quarterly HVAC inspection",
    type: "inspection", frequency: "quarterly",
    nextDueAt: NOW + 86_400_000 * 14,
    lastDoneAt: NOW - 86_400_000 * 76,
    status: "scheduled",
    estimatedCost: 2_500_000,
    createdAt: NOW - 86_400_000 * 365, updatedAt: NOW - 86_400_000 * 76,
  },
  {
    _id: _id("mt_4"), workspaceId: _wsId, branchId: "main",
    title: "Coffee grinder burr replacement",
    type: "preventive", frequency: "yearly",
    nextDueAt: NOW + 86_400_000 * 60,
    lastDoneAt: NOW - 86_400_000 * 305,
    status: "completed",
    estimatedCost: 850_000, actualCost: 920_000,
    completedAt: NOW - 86_400_000 * 7,
    createdAt: NOW - 86_400_000 * 305, updatedAt: NOW - 86_400_000 * 7,
  },
]

const MOCK_SUMMARY: MaintenanceSummary = {
  total: MOCK_TASKS.length,
  scheduled: MOCK_TASKS.filter((t) => t.status === "scheduled").length,
  inProgress: MOCK_TASKS.filter((t) => t.status === "in_progress").length,
  overdue: MOCK_TASKS.filter((t) => t.status === "overdue").length,
  totalCost: MOCK_TASKS.reduce((s, t) => s + (t.actualCost ?? t.estimatedCost ?? 0), 0),
}

function MaintenanceSchedulingPreview({ compact }: FeaturePreviewProps) {
  if (compact) {
    return (
      <div className="p-4 text-center">
        <h3 className="text-lg font-semibold">Maintenance Scheduling</h3>
        <p className="mt-2 text-xs text-muted-foreground">
          {MOCK_SUMMARY.scheduled} scheduled · {MOCK_SUMMARY.overdue} overdue
        </p>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col gap-4 overflow-auto p-4">
      <TaskStatsCards summary={MOCK_SUMMARY} />
      <TaskList items={MOCK_TASKS} onSelect={() => { /* preview: no-op */ }} />
    </div>
  )
}

export default defineFeaturePreview({
  featureId: "maintenance-scheduling",
  name: "Maintenance Scheduling",
  description: "Recurring preventive tasks plus reactive work orders with auto-reschedule.",
  component: MaintenanceSchedulingPreview,
  category: "operations",
  tags: ["maintenance", "scheduling", "recurring", "tasks"],
  mockDataSets: [
    {
      id: "default",
      name: "Coffee shop maintenance",
      description: "Mix of preventive, reactive, and inspection tasks across statuses.",
      data: { tasks: MOCK_TASKS, summary: MOCK_SUMMARY },
    },
  ],
})
