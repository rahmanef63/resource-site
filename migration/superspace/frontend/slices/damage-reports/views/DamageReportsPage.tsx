"use client"

import React, { useMemo, useState } from "react"
import { AlertTriangle } from "lucide-react"
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
import { Label } from "@/components/ui/label"
import { useDamageReports } from "../hooks/useDamageReports"
import { ReportStatsCards } from "../components/ReportStatsCards"
import { ReportList } from "../components/ReportList"
import { ReportCreateDialog } from "../components/ReportCreateDialog"
import { ReportDetailDrawer } from "../components/ReportDetailDrawer"
import type { DamageReport, ReportStatus, Severity } from "../types"
import { SEVERITIES, SEVERITY_LABELS } from "../types"

interface DamageReportsPageProps {
  workspaceId?: Id<"workspaces"> | null
}

export default function DamageReportsPage({ workspaceId }: DamageReportsPageProps) {
  const { items, summary, isLoading, createReport, triageReport, resolveReport } =
    useDamageReports(workspaceId)
  const [statusFilter, setStatusFilter] = useState<ReportStatus | "all">("all")
  const [severityFilter, setSeverityFilter] = useState<Severity | "all">("all")
  const [selected, setSelected] = useState<DamageReport | null>(null)

  const filtered = useMemo(
    () =>
      items.filter(
        (i) =>
          (statusFilter === "all" || i.status === statusFilter) &&
          (severityFilter === "all" || i.severity === severityFilter),
      ),
    [items, statusFilter, severityFilter],
  )

  if (!workspaceId) {
    return (
      <FeatureShell featureId="damage-reports" padding centered>
        <div className="text-center">
          <AlertTriangle className="mx-auto h-10 w-10 text-muted-foreground" />
          <h2 className="mt-4 text-lg font-semibold">No workspace selected</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Select a workspace to report and track damage incidents.
          </p>
        </div>
      </FeatureShell>
    )
  }

  return (
    <FeatureShell
      featureId="damage-reports"
      padding
      maxWidth="full"
      aiPlaceholder="Ask about open incidents, critical damage, total cost…"
      inspector={
        selected ? (
          <ReportDetailDrawer
            report={selected}
            onClose={() => setSelected(null)}
            onTriage={async (id, assigneeId) => {
              await triageReport(id, assigneeId)
              const updated = items.find((i) => i._id === id)
              setSelected(updated ?? null)
            }}
            onResolve={async (id, input) => {
              await resolveReport(id, input)
              const updated = items.find((i) => i._id === id)
              setSelected(updated ?? null)
            }}
          />
        ) : undefined
      }
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="flex items-center gap-2 text-xl font-semibold">
              <AlertTriangle className="h-5 w-5" />
              Damage Reports
            </h1>
            <p className="text-sm text-muted-foreground">
              File incidents, triage to an owner, and record repair or write-off outcomes.
            </p>
          </div>
          <ReportCreateDialog onCreate={createReport} />
        </div>

        <ReportStatsCards summary={summary} />

        <div className="flex flex-wrap items-end gap-3">
          <Tabs
            value={statusFilter}
            onValueChange={(v) => setStatusFilter(v as ReportStatus | "all")}
            className="flex-1 min-w-0"
          >
            <TabsList className="inline-flex flex-wrap">
              <TabsTrigger value="all">All ({items.length})</TabsTrigger>
              <TabsTrigger value="reported">
                Reported ({items.filter((i) => i.status === "reported").length})
              </TabsTrigger>
              <TabsTrigger value="triaged">
                Triaged ({items.filter((i) => i.status === "triaged").length})
              </TabsTrigger>
              <TabsTrigger value="investigating">
                Investigating ({items.filter((i) => i.status === "investigating").length})
              </TabsTrigger>
              <TabsTrigger value="resolved">
                Resolved ({items.filter((i) => i.status === "resolved").length})
              </TabsTrigger>
              <TabsTrigger value="written-off">
                Written off ({items.filter((i) => i.status === "written-off").length})
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="grid gap-1">
            <Label htmlFor="severityFilter" className="text-xs text-muted-foreground">
              Severity
            </Label>
            <Select
              value={severityFilter}
              onValueChange={(v) => setSeverityFilter(v as Severity | "all")}
            >
              <SelectTrigger id="severityFilter" className="h-9 w-[140px]">
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
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
            Loading damage reports…
          </div>
        ) : (
          <ReportList
            items={filtered}
            onSelect={setSelected}
            emptyAction={<ReportCreateDialog onCreate={createReport} />}
          />
        )}
      </div>
    </FeatureShell>
  )
}
