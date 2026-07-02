"use client";

/**
 * AiAgentsPage — Autonomous AI worker dashboard (NON-FUNCTIONAL SCAFFOLD).
 *
 * Adopted alongside the existing AI engine (`convex/features/ai`, untouched).
 * This view is intentionally static: it renders a task queue, run traces, and
 * an agent registry from in-memory demo data. No convex query/mutation and no
 * provider/SDK/LLM call is made — the "Run agent" action only appends a local
 * placeholder run so the trace UI can be previewed. Wire `createAgentRunner`
 * (see ../runner) to a real ToolHost + the shared agentic loop to make it live.
 */

import { useState } from "react";
import {
  Activity,
  Bot,
  BrainCircuit,
  CheckCircle2,
  CircleDot,
  Clock,
  Coins,
  Gauge,
  ListChecks,
  Play,
  Plus,
  Timer,
  XCircle,
} from "lucide-react";

import { FeatureShell } from "@/frontend/shared/ui/layout/feature-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

import type { AgentRun, RunStatus, RunStep, StepStatus } from "../types";

// --- Static demo data ------------------------------------------------------
const DEMO_AGENTS = [
  {
    slug: "audit-bp",
    name: "Best-Practice Auditor",
    description: "Scans slices for RBAC / audit / index gaps and files findings.",
    runs: 42,
  },
  {
    slug: "content-writer",
    name: "Content Writer",
    description: "Drafts storefront copy and product descriptions from a brief.",
    runs: 17,
  },
  {
    slug: "triage-bot",
    name: "Inbox Triage",
    description: "Labels and routes incoming support threads by intent.",
    runs: 8,
  },
] as const;

const DEMO_STEPS: RunStep[] = [
  { index: 0, name: "plan", result: "Break task into 3 subtasks", status: "done" },
  { index: 1, name: "search_slices", args: '{"query":"mutation"}', result: "12 files", status: "done" },
  { index: 2, name: "read_file", args: '{"path":"convex/features/sales/mutations.ts"}', result: "ok", status: "done" },
  { index: 3, name: "respond", result: "No RBAC gaps found in sales.", status: "done" },
];

const DEMO_RUNS: AgentRun[] = [
  {
    id: "run_demo_1",
    workspaceId: "local",
    agentSlug: "audit-bp",
    input: "Audit frontend/slices/sales for RBAC gaps",
    status: "success",
    steps: DEMO_STEPS,
    costUsd: 0.021,
    latencyMs: 4200,
    startedAt: Date.now() - 60_000,
    finishedAt: Date.now() - 55_800,
  },
  {
    id: "run_demo_2",
    workspaceId: "local",
    agentSlug: "content-writer",
    input: "Write hero copy for the new POS onboarding screen",
    status: "running",
    steps: DEMO_STEPS.slice(0, 2),
    startedAt: Date.now() - 8_000,
  },
  {
    id: "run_demo_3",
    workspaceId: "local",
    agentSlug: "triage-bot",
    input: "Triage 14 unread support threads",
    status: "queued",
    steps: [],
    scheduleAt: Date.now() + 120_000,
  },
  {
    id: "run_demo_4",
    workspaceId: "local",
    agentSlug: "audit-bp",
    input: "Audit frontend/slices/cmsLite for missing indexes",
    status: "failed",
    steps: [
      { index: 0, name: "plan", result: "ok", status: "done" },
      { index: 1, name: "error", result: "Tool host unavailable (scaffold)", status: "error" },
    ],
    costUsd: 0.004,
    latencyMs: 1300,
    startedAt: Date.now() - 300_000,
    finishedAt: Date.now() - 298_700,
  },
];

// --- Presentational helpers ------------------------------------------------
const RUN_STATUS_STYLE: Record<RunStatus, string> = {
  queued: "bg-muted text-muted-foreground",
  running: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
  success: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  failed: "bg-red-500/15 text-red-600 dark:text-red-400",
};

function StepIcon({ status }: { status: StepStatus }) {
  if (status === "done")
    return <CheckCircle2 className="size-4 text-emerald-500" aria-hidden />;
  if (status === "error")
    return <XCircle className="size-4 text-red-500" aria-hidden />;
  if (status === "running")
    return <Activity className="size-4 animate-pulse text-blue-500" aria-hidden />;
  return <CircleDot className="size-4 text-muted-foreground" aria-hidden />;
}

function KpiCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Gauge;
  label: string;
  value: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-4">
        <div className="grid size-9 place-items-center rounded-md bg-primary/10 text-primary">
          <Icon className="size-5" aria-hidden />
        </div>
        <div className="min-w-0">
          <p className="truncate text-xs text-muted-foreground">{label}</p>
          <p className="text-lg font-semibold tabular-nums">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

// --- Page ------------------------------------------------------------------
export default function AiAgentsPage() {
  const [runs, setRuns] = useState<AgentRun[]>(DEMO_RUNS);
  const [selectedId, setSelectedId] = useState<string>(DEMO_RUNS[0]!.id);

  const selected = runs.find((r) => r.id === selectedId) ?? runs[0];
  const activeCount = runs.filter((r) => r.status === "running").length;
  const queuedCount = runs.filter((r) => r.status === "queued").length;
  const totalCost = runs.reduce((sum, r) => sum + (r.costUsd ?? 0), 0);

  // Non-functional: append a local placeholder run. No backend, no LLM call.
  function enqueueDemoRun() {
    const id = `run_local_${runs.length + 1}`;
    setRuns((prev) => [
      {
        id,
        workspaceId: "local",
        agentSlug: "audit-bp",
        input: "New queued task (scaffold placeholder)",
        status: "queued",
        steps: [],
        scheduleAt: Date.now() + 30_000,
      },
      ...prev,
    ]);
    setSelectedId(id);
  }

  return (
    <FeatureShell featureId="ai-agents">
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-lg bg-primary/10 text-primary">
              <BrainCircuit className="size-6" aria-hidden />
            </div>
            <div>
              <h1 className="text-xl font-semibold leading-tight">AI Agents</h1>
              <p className="text-sm text-muted-foreground">
                Autonomous workers — task queue and run traces.
              </p>
            </div>
          </div>
          <Button onClick={enqueueDemoRun}>
            <Plus className="size-4" aria-hidden />
            Run agent
          </Button>
        </div>

        <div className="rounded-md border border-dashed border-amber-500/40 bg-amber-500/5 px-3 py-2 text-xs text-amber-700 dark:text-amber-400">
          Non-functional scaffold. This dashboard is preview-only — no agent
          actually runs and no AI provider is called.
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <KpiCard icon={Activity} label="Running" value={String(activeCount)} />
          <KpiCard icon={Clock} label="Queued" value={String(queuedCount)} />
          <KpiCard icon={ListChecks} label="Total runs" value={String(runs.length)} />
          <KpiCard icon={Coins} label="Cost (USD)" value={`$${totalCost.toFixed(3)}`} />
        </div>
      </div>

      <Tabs defaultValue="runs" className="mt-4">
        <TabsList>
          <TabsTrigger value="runs">
            <ListChecks className="size-4" aria-hidden />
            Runs
          </TabsTrigger>
          <TabsTrigger value="trace">
            <Activity className="size-4" aria-hidden />
            Trace
          </TabsTrigger>
          <TabsTrigger value="agents">
            <Bot className="size-4" aria-hidden />
            Agents
          </TabsTrigger>
        </TabsList>

        {/* Runs queue ------------------------------------------------------ */}
        <TabsContent value="runs" className="mt-3">
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Agent</TableHead>
                  <TableHead>Task</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Steps</TableHead>
                  <TableHead className="text-right">Latency</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {runs.map((run) => (
                  <TableRow
                    key={run.id}
                    data-state={run.id === selectedId ? "selected" : undefined}
                    className="cursor-pointer"
                    onClick={() => setSelectedId(run.id)}
                  >
                    <TableCell className="font-medium">{run.agentSlug}</TableCell>
                    <TableCell className="max-w-[22rem] truncate text-muted-foreground">
                      {run.input}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={cn("capitalize", RUN_STATUS_STYLE[run.status])}
                      >
                        {run.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {run.steps.length}
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-muted-foreground">
                      {run.latencyMs ? `${(run.latencyMs / 1000).toFixed(1)}s` : "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* Run trace ------------------------------------------------------- */}
        <TabsContent value="trace" className="mt-3">
          <Card>
            <CardHeader>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Play className="size-4" aria-hidden />
                    {selected?.agentSlug ?? "—"}
                  </CardTitle>
                  <CardDescription className="mt-1">
                    {selected?.input ?? "Select a run to inspect its trace."}
                  </CardDescription>
                </div>
                {selected ? (
                  <Badge
                    variant="secondary"
                    className={cn("capitalize", RUN_STATUS_STYLE[selected.status])}
                  >
                    {selected.status}
                  </Badge>
                ) : null}
              </div>
            </CardHeader>
            <CardContent>
              {selected && selected.steps.length > 0 ? (
                <ScrollArea className="h-[22rem] pr-3">
                  <ol className="space-y-2">
                    {selected.steps.map((step) => (
                      <li
                        key={step.index}
                        className="flex items-start gap-3 rounded-md border bg-card p-3"
                      >
                        <StepIcon status={step.status} />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{step.name}</span>
                            <span className="text-xs text-muted-foreground">
                              #{step.index}
                            </span>
                          </div>
                          {step.args ? (
                            <pre className="mt-1 overflow-x-auto rounded bg-muted px-2 py-1 text-xs">
                              {step.args}
                            </pre>
                          ) : null}
                          {step.result ? (
                            <p className="mt-1 text-sm text-muted-foreground">
                              {step.result}
                            </p>
                          ) : null}
                        </div>
                      </li>
                    ))}
                  </ol>
                </ScrollArea>
              ) : (
                <div className="flex flex-col items-center gap-2 rounded-md border border-dashed p-8 text-center">
                  <Timer className="size-6 text-muted-foreground" aria-hidden />
                  <p className="text-sm text-muted-foreground">
                    No steps yet — this run is queued.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Agent registry ------------------------------------------------- */}
        <TabsContent value="agents" className="mt-3">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {DEMO_AGENTS.map((agent) => (
              <Card key={agent.slug}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Bot className="size-4 text-primary" aria-hidden />
                    {agent.name}
                  </CardTitle>
                  <CardDescription>{agent.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="font-mono">{agent.slug}</span>
                    <span className="flex items-center gap-1">
                      <Gauge className="size-3.5" aria-hidden />
                      {agent.runs} runs
                    </span>
                  </div>
                  <Progress value={Math.min(100, agent.runs * 2)} />
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={enqueueDemoRun}
                  >
                    <Play className="size-4" aria-hidden />
                    Run
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </FeatureShell>
  );
}
