"use client"

import * as React from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { defineFeaturePreview } from "@/frontend/shared/preview"
import type { FeaturePreviewProps } from "@/frontend/shared/preview"

import { ChecklistStatsCards, type ChecklistStats } from "../components/ChecklistStatsCards"
import { TemplateList } from "../components/TemplateList"
import { RunList } from "../components/RunList"
import type { ChecklistRun, ChecklistTemplate } from "../types"

const _tplId = (raw: string) => raw as unknown as ChecklistTemplate["_id"]
const _runId = (raw: string) => raw as unknown as ChecklistRun["_id"]
const _wsId = "ws_demo" as unknown as ChecklistTemplate["workspaceId"]
const _userId = "user_demo" as unknown as ChecklistTemplate["createdBy"]
const NOW = Date.now()
const day = (offset: number) => new Date(NOW - 86_400_000 * offset).toISOString().slice(0, 10)

const MOCK_TEMPLATES: ChecklistTemplate[] = [
  {
    _id: _tplId("tpl_open"), workspaceId: _wsId, branchId: "main",
    name: "Morning open",
    description: "All tasks before doors open at 7am",
    scope: "opening",
    items: [
      { id: "i1", label: "Brew test shot",         order: 1, required: true },
      { id: "i2", label: "Check pastry stock",     order: 2, required: true },
      { id: "i3", label: "Wipe down all surfaces", order: 3, required: true, photoRequired: true },
      { id: "i4", label: "Set music + lighting",   order: 4, required: false },
    ],
    isActive: true, createdBy: _userId,
    createdAt: NOW - 86_400_000 * 90, updatedAt: NOW - 86_400_000 * 30,
  },
  {
    _id: _tplId("tpl_close"), workspaceId: _wsId, branchId: "main",
    name: "Evening close",
    scope: "closing",
    items: [
      { id: "c1", label: "Clean espresso machine", order: 1, required: true, photoRequired: true },
      { id: "c2", label: "Reconcile cash drawer",  order: 2, required: true, notesRequired: true },
      { id: "c3", label: "Lock back door",         order: 3, required: true },
    ],
    isActive: true, createdBy: _userId,
    createdAt: NOW - 86_400_000 * 90, updatedAt: NOW - 86_400_000 * 60,
  },
]

const MOCK_RUNS: ChecklistRun[] = [
  {
    _id: _runId("run_1"), workspaceId: _wsId, templateId: MOCK_TEMPLATES[0]._id, branchId: "main",
    runDate: day(0),
    completedItems: [
      { itemId: "i1", completed: true, completedAt: NOW - 3_600_000 * 5 },
      { itemId: "i2", completed: true, completedAt: NOW - 3_600_000 * 5 },
      { itemId: "i3", completed: false },
      { itemId: "i4", completed: false },
    ],
    overallStatus: "in_progress",
    createdAt: NOW - 3_600_000 * 5, updatedAt: NOW - 3_600_000 * 1,
  },
  {
    _id: _runId("run_2"), workspaceId: _wsId, templateId: MOCK_TEMPLATES[1]._id, branchId: "main",
    runDate: day(1),
    completedItems: [
      { itemId: "c1", completed: true, completedAt: NOW - 86_400_000 + 3_600_000 * 1, photoUrl: "https://placehold.co/200" },
      { itemId: "c2", completed: true, completedAt: NOW - 86_400_000 + 3_600_000 * 1, notes: "Cash matched expected" },
      { itemId: "c3", completed: true, completedAt: NOW - 86_400_000 + 3_600_000 * 2 },
    ],
    overallStatus: "approved", reviewedBy: _userId, reviewedAt: NOW - 86_400_000 + 3_600_000 * 4,
    createdAt: NOW - 86_400_000, updatedAt: NOW - 86_400_000 + 3_600_000 * 4,
  },
]

const MOCK_STATS: ChecklistStats = {
  templates: MOCK_TEMPLATES.length,
  activeRuns: MOCK_RUNS.filter((r) => r.overallStatus === "in_progress" || r.overallStatus === "pending").length,
  inReview: MOCK_RUNS.filter((r) => r.overallStatus === "review").length,
  approvedToday: MOCK_RUNS.filter((r) => r.overallStatus === "approved" && r.runDate === day(0)).length,
}

function OperationalChecklistPreview({ compact }: FeaturePreviewProps) {
  if (compact) {
    return (
      <div className="p-4 text-center">
        <h3 className="text-lg font-semibold">Operational Checklist</h3>
        <p className="mt-2 text-xs text-muted-foreground">
          {MOCK_STATS.templates} templates · {MOCK_STATS.activeRuns} active run
        </p>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col gap-4 overflow-auto p-4">
      <ChecklistStatsCards stats={MOCK_STATS} />
      <Tabs defaultValue="runs" className="flex flex-1 flex-col">
        <TabsList className="flex w-full self-start justify-evenly">
          <TabsTrigger value="runs">Runs ({MOCK_RUNS.length})</TabsTrigger>
          <TabsTrigger value="templates">Templates ({MOCK_TEMPLATES.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="runs" className="mt-4">
          <RunList items={MOCK_RUNS} templates={MOCK_TEMPLATES} onSelect={() => { /* preview: no-op */ }} />
        </TabsContent>
        <TabsContent value="templates" className="mt-4">
          <TemplateList items={MOCK_TEMPLATES} onSelect={() => { /* preview: no-op */ }} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default defineFeaturePreview({
  featureId: "operational-checklist",
  name: "Operational Checklist",
  description: "Reusable opening/closing/audit templates with photo+notes capture per run.",
  component: OperationalChecklistPreview,
  category: "operations",
  tags: ["checklist", "operations", "audit", "compliance"],
  mockDataSets: [
    {
      id: "default",
      name: "Open + close templates",
      description: "Two templates with one in-progress and one approved run.",
      data: { templates: MOCK_TEMPLATES, runs: MOCK_RUNS, stats: MOCK_STATS },
    },
  ],
})
