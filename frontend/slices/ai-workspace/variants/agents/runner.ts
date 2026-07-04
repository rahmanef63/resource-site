"use client";

// Real run execution on the shared agentic kit. The runner is NOT a new agent
// model: it drives the ONE shared function-calling loop (@/shared/agentic)
// against whatever ToolHost it is given (typically a createToolRegistry()
// aggregating many slices' collections) and records each tool_use as a
// RunStep so AgentRunTrace/AgentQueue can render live traces.

import { runAgentLoop, type AgentMsg, type ToolHost } from "@/shared/agentic";
import type { AgentRun, RunStep } from "./types";

export type StartRunOpts = {
  workspaceId?: string;
  agentSlug?: string;
  maxTurns?: number;
  /** Called after every step mutation with a fresh snapshot. */
  onUpdate?: (run: AgentRun) => void;
};

let seq = 0;

export function createAgentRunner(host: ToolHost) {
  const runs = new Map<string, AgentRun>();

  async function startRun(input: string, opts: StartRunOpts = {}): Promise<AgentRun> {
    const id = `run_${Date.now().toString(36)}_${++seq}`;
    const run: AgentRun = {
      id,
      workspaceId: opts.workspaceId ?? "local",
      agentSlug: opts.agentSlug ?? "default",
      input,
      status: "running",
      steps: [],
      startedAt: Date.now(),
    };
    runs.set(id, run);
    const push = () => opts.onUpdate?.({ ...run, steps: run.steps.slice() });
    push();

    try {
      const history: AgentMsg[] = [{ role: "user", text: input }];
      const { text } = await runAgentLoop(
        history,
        host,
        {
          onTool: (name, args, outcome) => {
            const step: RunStep = {
              index: run.steps.length,
              name,
              args: JSON.stringify(args),
              result: outcome.result,
              status: outcome.ok ? "done" : "error",
              startedAt: Date.now(),
              finishedAt: Date.now(),
            };
            run.steps.push(step);
            push();
          },
        },
        opts.maxTurns ?? 8,
      );
      run.steps.push({
        index: run.steps.length,
        name: "respond",
        result: text,
        status: "done",
        finishedAt: Date.now(),
      });
      run.status = "success";
    } catch (e) {
      run.steps.push({
        index: run.steps.length,
        name: "error",
        result: e instanceof Error ? e.message : String(e),
        status: "error",
        finishedAt: Date.now(),
      });
      run.status = "failed";
    }
    run.finishedAt = Date.now();
    run.latencyMs = run.finishedAt - (run.startedAt ?? run.finishedAt);
    push();
    return run;
  }

  return {
    startRun,
    getRun: (id: string): AgentRun | undefined => runs.get(id),
    listRuns: (): AgentRun[] => [...runs.values()],
  };
}

export type AgentRunner = ReturnType<typeof createAgentRunner>;
