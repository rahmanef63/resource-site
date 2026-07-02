"use client"

import React, { useEffect, useMemo, useState } from "react"
import { ClipboardCheck } from "lucide-react"
import type { Id } from "@convex/_generated/dataModel"
import { FeatureShell } from "@/frontend/shared/ui/layout/feature-shell"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SharedDatePicker } from "@/frontend/shared/foundation/utils/datepicker"
import { format, parseISO } from "date-fns"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useOperationalChecklist } from "../hooks/useOperationalChecklist"
import {
  ChecklistStatsCards,
  type ChecklistStats,
} from "../components/ChecklistStatsCards"
import { TemplateList } from "../components/TemplateList"
import { RunList } from "../components/RunList"
import { TemplateCreateDialog } from "../components/TemplateCreateDialog"
import { TemplateDetailDrawer } from "../components/TemplateDetailDrawer"
import { RunDetailDrawer } from "../components/RunDetailDrawer"
import { StartRunDialog } from "../components/StartRunDialog"
import type { ChecklistRun, ChecklistTemplate, RunStatus } from "../types"
import { RUN_STATUSES, RUN_STATUS_LABELS, SCOPES, SCOPE_LABELS } from "../types"

type TopTab = "templates" | "runs"
type ScopeFilter = "all" | (typeof SCOPES)[number]
type StatusFilter = "all" | RunStatus

interface OperationalChecklistPageProps {
  workspaceId?: Id<"workspaces"> | null
}

function todayISO(): string {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}

export default function OperationalChecklistPage({
  workspaceId,
}: OperationalChecklistPageProps) {
  const {
    templates,
    runs,
    isLoading,
    createTemplate,
    startRun,
    checkItem,
    completeRun,
    reviewRun,
  } = useOperationalChecklist(workspaceId)

  const [topTab, setTopTab] = useState<TopTab>("templates")

  // Templates tab state
  const [scopeFilter, setScopeFilter] = useState<ScopeFilter>("all")
  const [selectedTemplate, setSelectedTemplate] = useState<ChecklistTemplate | null>(
    null,
  )

  // Runs tab state
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
  const [dateFrom, setDateFrom] = useState<string>("")
  const [dateTo, setDateTo] = useState<string>("")
  const [selectedRun, setSelectedRun] = useState<ChecklistRun | null>(null)

  // Start-run dialog state (template → run)
  const [startRunOpen, setStartRunOpen] = useState(false)
  const [startRunTemplateId, setStartRunTemplateId] = useState<string | undefined>(
    undefined,
  )

  // Keep the inspector-bound selectedRun / selectedTemplate in sync with live queries.
  useEffect(() => {
    if (!selectedRun) return
    const live = runs.find((r) => r._id === selectedRun._id)
    if (live && live !== selectedRun) setSelectedRun(live)
  }, [runs, selectedRun])

  useEffect(() => {
    if (!selectedTemplate) return
    const live = templates.find((t) => t._id === selectedTemplate._id)
    if (live && live !== selectedTemplate) setSelectedTemplate(live)
  }, [templates, selectedTemplate])

  const filteredTemplates = useMemo(() => {
    if (scopeFilter === "all") return templates
    return templates.filter((t) => t.scope === scopeFilter)
  }, [templates, scopeFilter])

  const filteredRuns = useMemo(() => {
    return runs.filter((r) => {
      if (statusFilter !== "all" && r.overallStatus !== statusFilter) return false
      if (dateFrom && r.runDate < dateFrom) return false
      if (dateTo && r.runDate > dateTo) return false
      return true
    })
  }, [runs, statusFilter, dateFrom, dateTo])

  const stats = useMemo<ChecklistStats>(() => {
    const today = todayISO()
    const activeRuns = runs.filter(
      (r) =>
        r.overallStatus === "pending" ||
        r.overallStatus === "in_progress" ||
        r.overallStatus === "completed",
    ).length
    const inReview = runs.filter((r) => r.overallStatus === "review").length
    const approvedToday = runs.filter(
      (r) => r.overallStatus === "approved" && r.runDate === today,
    ).length
    return {
      templates: templates.length,
      activeRuns,
      inReview,
      approvedToday,
    }
  }, [templates, runs])

  if (!workspaceId) {
    return (
      <FeatureShell featureId="operational-checklist" padding centered>
        <div className="text-center">
          <ClipboardCheck className="mx-auto h-10 w-10 text-muted-foreground" />
          <h2 className="mt-4 text-lg font-semibold">No workspace selected</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Select a workspace to build and run operational checklists.
          </p>
        </div>
      </FeatureShell>
    )
  }


  const templateForSelectedRun = selectedRun
    ? templates.find((t) => String(t._id) === String(selectedRun.templateId)) ?? null
    : null

  const inspector =
    topTab === "templates" && selectedTemplate ? (
      <TemplateDetailDrawer
        template={selectedTemplate}
        onClose={() => setSelectedTemplate(null)}
        onStartRun={(t) => {
          setStartRunTemplateId(String(t._id))
          setStartRunOpen(true)
        }}
      />
    ) : topTab === "runs" && selectedRun ? (
      <RunDetailDrawer
        run={selectedRun}
        template={templateForSelectedRun}
        onClose={() => setSelectedRun(null)}
        onCheckItem={async (id, input) => {
          await checkItem(id, input)
        }}
        onComplete={async (id) => {
          await completeRun(id)
        }}
        onReview={async (id, input) => {
          await reviewRun(id, input)
        }}
      />
    ) : undefined

  const runCountByStatus = useMemo(() => {
    const m = new Map<RunStatus, number>()
    for (const r of runs) m.set(r.overallStatus, (m.get(r.overallStatus) ?? 0) + 1)
    return m
  }, [runs])

  return (
    <FeatureShell
      featureId="operational-checklist"
      padding
      maxWidth="full"
      aiPlaceholder="Ask about templates, active runs, items to check, review approvals…"
      inspector={inspector}
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="flex items-center gap-2 text-xl font-semibold">
              <ClipboardCheck className="h-5 w-5" />
              Operational Checklist
            </h1>
            <p className="text-sm text-muted-foreground">
              Build templates, run them daily, capture photos + notes, and route to review.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <StartRunDialog
              templates={templates}
              defaultTemplateId={startRunTemplateId}
              open={startRunOpen}
              onOpenChange={(o) => {
                setStartRunOpen(o)
                if (!o) setStartRunTemplateId(undefined)
              }}
              onStart={async (input) => {
                await startRun(input)
              }}
            />
            <TemplateCreateDialog onCreate={createTemplate} />
          </div>
        </div>

        <ChecklistStatsCards stats={stats} />

        <Tabs value={topTab} onValueChange={(v) => setTopTab(v as TopTab)}>
          <TabsList className="inline-flex flex-wrap">
            <TabsTrigger value="templates">
              Templates ({templates.length})
            </TabsTrigger>
            <TabsTrigger value="runs">Runs ({runs.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="templates" className="mt-4 flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <Label className="text-xs text-muted-foreground" htmlFor="scope-filter">
                Scope
              </Label>
              <Select
                value={scopeFilter}
                onValueChange={(v) => setScopeFilter(v as ScopeFilter)}
              >
                <SelectTrigger id="scope-filter" className="h-8 w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All scopes</SelectItem>
                  {SCOPES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {SCOPE_LABELS[s]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
                Loading templates…
              </div>
            ) : (
              <TemplateList
                items={filteredTemplates}
                onSelect={setSelectedTemplate}
                emptyAction={<TemplateCreateDialog onCreate={createTemplate} />}
              />
            )}
          </TabsContent>

          <TabsContent value="runs" className="mt-4 flex flex-col gap-3">
            <div className="flex flex-wrap items-end gap-3">
              <div className="flex items-center gap-2">
                <Label className="text-xs text-muted-foreground" htmlFor="status-filter">
                  Status
                </Label>
                <Select
                  value={statusFilter}
                  onValueChange={(v) => setStatusFilter(v as StatusFilter)}
                >
                  <SelectTrigger id="status-filter" className="h-8 w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All statuses</SelectItem>
                    {RUN_STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {RUN_STATUS_LABELS[s]} ({runCountByStatus.get(s) ?? 0})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <Label className="text-xs text-muted-foreground">From</Label>
                <SharedDatePicker
                  date={dateFrom ? parseISO(dateFrom) : undefined}
                  onChange={(d) => setDateFrom(d ? format(d, "yyyy-MM-dd") : "")}
                  placeholder="From"
                  className="h-8 w-[180px]"
                />
              </div>
              <div className="flex items-center gap-2">
                <Label className="text-xs text-muted-foreground">To</Label>
                <SharedDatePicker
                  date={dateTo ? parseISO(dateTo) : undefined}
                  onChange={(d) => setDateTo(d ? format(d, "yyyy-MM-dd") : "")}
                  placeholder="To"
                  className="h-8 w-[180px]"
                />
              </div>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
                Loading runs…
              </div>
            ) : (
              <RunList
                items={filteredRuns}
                templates={templates}
                onSelect={setSelectedRun}
                emptyHint={
                  runs.length === 0
                    ? "No runs started yet — open a template and click 'Start run' to begin."
                    : "No runs match the current filters."
                }
              />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </FeatureShell>
  )
}
