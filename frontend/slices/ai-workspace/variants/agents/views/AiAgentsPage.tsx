"use client";

/**
 * AiAgentsPage — Autonomous AI worker dashboard (NON-FUNCTIONAL SCAFFOLD).
 *
 * Renders a task queue, run traces, and an agent registry from in-memory demo
 * data. No convex query/mutation and no provider/SDK/LLM call is made — the
 * "Run agent" action only appends a local placeholder run. Wire `createAgentRunner`
 * (see ../runner) to a real ToolHost + the shared agentic loop to make it live.
 */

import { useState } from "react";
import { Activity, BrainCircuit, Clock, Coins, ListChecks, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";

import type { AgentRun } from "../types";
import { DEMO_RUNS } from "./demo";
import { KpiCard } from "./parts";
import { AgentTabs } from "./AgentTabs";

export default function AiAgentsPage() {
  const [runs, setRuns] = useState<AgentRun[]>(DEMO_RUNS);
  const [selectedId, setSelectedId] = useState<string>(DEMO_RUNS[0]!.id);

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
    // ponytail: was superspace <FeatureShell> chrome; a plain container is enough for a distributable slice — consumer owns outer layout
    <div className="h-full p-4">
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

      <AgentTabs
        runs={runs}
        selectedId={selectedId}
        onSelect={setSelectedId}
        onRun={enqueueDemoRun}
      />
    </div>
  );
}
