"use client"

import React, { useMemo, useState } from "react"
import { Activity } from "lucide-react"
import type { Id } from "@convex/_generated/dataModel"
import { FeatureShell } from "@/frontend/shared/ui/layout/feature-shell"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useBranchHealth } from "../hooks/useBranchHealth"
import { HealthStatsCards } from "../components/HealthStatsCards"
import { SnapshotList } from "../components/SnapshotList"
import { CaptureSnapshotDialog } from "../components/CaptureSnapshotDialog"
import { SnapshotDetailDrawer } from "../components/SnapshotDetailDrawer"
import type { BranchHealthSnapshot } from "../types"

interface BranchHealthScoringPageProps {
  workspaceId?: Id<"workspaces"> | null
}

export default function BranchHealthScoringPage({
  workspaceId,
}: BranchHealthScoringPageProps) {
  const { items, latestPerBranch, isLoading, captureSnapshot } =
    useBranchHealth(workspaceId)
  const [branchFilter, setBranchFilter] = useState<string>("all")
  const [selected, setSelected] = useState<BranchHealthSnapshot | null>(null)

  const branchIds = useMemo(() => {
    const set = new Set<string>()
    for (const row of items) set.add(row.branchId)
    return Array.from(set).sort()
  }, [items])

  const filtered = useMemo(
    () => (branchFilter === "all" ? items : items.filter((i) => i.branchId === branchFilter)),
    [items, branchFilter],
  )

  if (!workspaceId) {
    return (
      <FeatureShell featureId="branch-health-scoring" padding centered>
        <div className="text-center">
          <Activity className="mx-auto h-10 w-10 text-muted-foreground" />
          <h2 className="mt-4 text-lg font-semibold">No workspace selected</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Select a workspace to capture branch health snapshots.
          </p>
        </div>
      </FeatureShell>
    )
  }

  return (
    <FeatureShell
      featureId="branch-health-scoring"
      padding
      maxWidth="full"
      aiPlaceholder="Ask about branch health trends, weak categories, composite scores…"
      inspector={
        selected ? (
          <SnapshotDetailDrawer
            snapshot={selected}
            onClose={() => setSelected(null)}
          />
        ) : undefined
      }
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="flex items-center gap-2 text-xl font-semibold">
              <Activity className="h-5 w-5" />
              Branch Health Scoring
            </h1>
            <p className="text-sm text-muted-foreground">
              Capture branch health snapshots across revenue, expense, ops, staff, and customer scores.
            </p>
          </div>
          <CaptureSnapshotDialog onCapture={captureSnapshot} />
        </div>

        <HealthStatsCards latestPerBranch={latestPerBranch} />

        <div className="flex flex-wrap items-center gap-3">
          <label className="text-xs text-muted-foreground" htmlFor="branch-filter">
            Branch
          </label>
          <Select
            value={branchFilter}
            onValueChange={(v) => setBranchFilter(v)}
          >
            <SelectTrigger id="branch-filter" className="h-8 w-[220px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All branches ({items.length})</SelectItem>
              {branchIds.map((b) => (
                <SelectItem key={b} value={b}>
                  {b} ({items.filter((i) => i.branchId === b).length})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
            Loading branch health snapshots…
          </div>
        ) : (
          <SnapshotList
            items={filtered}
            onSelect={setSelected}
            emptyAction={<CaptureSnapshotDialog onCapture={captureSnapshot} />}
          />
        )}
      </div>
    </FeatureShell>
  )
}
