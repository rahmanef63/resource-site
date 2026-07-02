"use client";

// Run execution surface for the ai-agents slice.
//
// NON-FUNCTIONAL SCAFFOLD: upstream this drove the ONE shared function-calling
// loop (rr `@/shared/agentic`) against a ToolHost and recorded each tool_use as
// a RunStep. `@/shared/agentic` does NOT exist in superspace, so the loop is
// stubbed locally below — it performs NO provider/SDK/LLM call and returns a
// canned acknowledgement. The public surface (createAgentRunner / AgentRunner /
// StartRunOpts) is preserved so the barrel and any callers still type-check.
// Wire a real ToolHost + shared loop when this slice is made live.

import type { AgentRun, RunStep } from "./types";

// --- Local stub for the absent shared agentic kit -------------------------
export type AgentMsg = { role: "user" | "assistant" | "system"; text: string };

type ToolOutcome = { ok: boolean; result?: string };

/**
 * Minimal placeholder for the shared agentic ToolHost. A live host would expose
 * tool schemas + an invoke method; the scaffold only needs a nominal type.
 */
export type ToolHost = {
  name?: string;
  tools?: unknown[];
};

type AgentLoopHooks = {
  onTool?: (name: string, args: unknown, outcome: ToolOutcome) => void;
};

/**
 * Stubbed agentic loop. Makes no external call — echoes the last user message
 * so the runner and dashboard can render a placeholder trace.
 */
async function runAgentLoop(
  history: AgentMsg[],
  _host: ToolHost,
  _hooks: AgentLoopHooks,
  _maxTurns: number,
): Promise<{ text: string }> {
  const last = history[history.length - 1]?.text ?? "";
  return {
    text: `[ai-agents scaffold] Agentic loop is not wired in superspace. Received: ${last}`,
  };
}
// --------------------------------------------------------------------------

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
