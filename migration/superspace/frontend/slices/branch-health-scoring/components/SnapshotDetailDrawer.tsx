"use client"

import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { formatRelativeTime } from "@/frontend/shared/foundation/utils/core/format"
import { PanelSection } from "@/frontend/shared/ui/layout/container/three-column"
import { ScoreBadge } from "./ScoreBadge"
import type { BranchHealthSnapshot, ScoreCategory } from "../types"
import {
  SCORE_CATEGORIES,
  SCORE_CATEGORY_LABELS,
  getScoreTier,
} from "../types"

const BAR_TIER_CLASS: Record<ReturnType<typeof getScoreTier>, string> = {
  healthy: "bg-emerald-500",
  steady: "bg-blue-500",
  watch: "bg-amber-500",
  critical: "bg-red-500",
}

function scoreFor(snapshot: BranchHealthSnapshot, cat: ScoreCategory): number {
  switch (cat) {
    case "revenue":
      return snapshot.revenueScore
    case "expense":
      return snapshot.expenseScore
    case "ops":
      return snapshot.opsScore
    case "staff":
      return snapshot.staffScore
    case "customer":
      return snapshot.customerScore
  }
}

function weightFor(snapshot: BranchHealthSnapshot, cat: ScoreCategory): number {
  return snapshot.weights[cat]
}

interface Props {
  snapshot: BranchHealthSnapshot | null
  onClose: () => void
}

export function SnapshotDetailDrawer({ snapshot, onClose }: Props) {
  if (!snapshot) return null

  return (
    <PanelSection>
      <PanelSection.Header className="flex items-start justify-between p-4">
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            Branch health snapshot
          </p>
          <h2 className="text-lg font-semibold">{snapshot.branchId}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Period {snapshot.period} · captured {formatRelativeTime(snapshot.capturedAt)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ScoreBadge score={snapshot.compositeScore} />
          <Button aria-label="Close" variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </PanelSection.Header>

      <PanelSection.Items className="p-4 text-sm">
        <div className="rounded-md border bg-muted/30 p-3">
          <div className="flex items-baseline justify-between">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Composite score
            </p>
            <span className="font-mono text-2xl font-semibold tabular-nums">
              {snapshot.compositeScore.toFixed(1)}
            </span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded bg-muted">
            <div
              className={cn(
                "h-full",
                BAR_TIER_CLASS[getScoreTier(snapshot.compositeScore)],
              )}
              style={{
                width: `${Math.max(0, Math.min(100, snapshot.compositeScore))}%`,
              }}
            />
          </div>
        </div>

        <div className="mt-4">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            Category breakdown
          </p>
          <ul className="mt-2 space-y-2">
            {SCORE_CATEGORIES.map((cat) => {
              const score = scoreFor(snapshot, cat)
              const weight = weightFor(snapshot, cat)
              const contribution = score * weight
              return (
                <li key={cat} className="rounded-md border p-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      {SCORE_CATEGORY_LABELS[cat]}
                    </span>
                    <span className="font-mono text-xs text-muted-foreground">
                      weight {weight.toFixed(2)} · contrib {contribution.toFixed(1)}
                    </span>
                  </div>
                  <div className="mt-1.5 flex items-center gap-2">
                    <div className="h-1.5 flex-1 overflow-hidden rounded bg-muted">
                      <div
                        className={cn("h-full", BAR_TIER_CLASS[getScoreTier(score)])}
                        style={{ width: `${Math.max(0, Math.min(100, score))}%` }}
                      />
                    </div>
                    <span className="w-10 text-right font-mono text-sm tabular-nums">
                      {score.toFixed(0)}
                    </span>
                  </div>
                </li>
              )
            })}
          </ul>
        </div>

        {snapshot.insights ? (
          <>
            <Separator className="my-4" />
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Insights{snapshot.insightsModel ? ` · ${snapshot.insightsModel}` : ""}
            </p>
            <p className="mt-1 whitespace-pre-wrap text-sm">{snapshot.insights}</p>
          </>
        ) : null}

        {snapshot.metricsSnapshot ? (
          <>
            <Separator className="my-4" />
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Metrics snapshot
            </p>
            <pre className="mt-1 overflow-auto rounded-md border bg-muted/40 p-2 font-mono text-[11px]">
              {JSON.stringify(snapshot.metricsSnapshot, null, 2)}
            </pre>
          </>
        ) : null}

        <Separator className="my-4" />
        <dl className="grid grid-cols-3 gap-x-4 gap-y-2 text-xs">
          <dt className="text-muted-foreground">Captured at</dt>
          <dd className="col-span-2 font-mono">
            {new Date(snapshot.capturedAt).toISOString()}
          </dd>
          <dt className="text-muted-foreground">Created</dt>
          <dd className="col-span-2">{formatRelativeTime(snapshot.createdAt)}</dd>
        </dl>
      </PanelSection.Items>
    </PanelSection>
  )
}
