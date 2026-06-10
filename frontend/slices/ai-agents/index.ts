/**
 * ai-agents slice — public barrel.
 *
 * Async autonomous worker dashboard. Mount `<RunnerDashboard />` at
 * /agents. Trigger runs via `runAgent({agentSlug, input, scheduleAt?})`.
 *
 *   import { RunnerDashboard, useAgentRuns } from "@/features/ai-agents";
 *
 * Status: 0.2.0 — the runner EXECUTES for real: createAgentRunner(host)
 * drives the shared function-calling loop (@/shared/agentic) against any
 * ToolHost (e.g. a createToolRegistry() aggregating many slices' tool
 * collections) and records each tool_use as a RunStep trace. Dashboard UI
 * target at /preview/slices/ai-agents.
 */

export type {
  AgentRun, RunStatus, RunStep, StepStatus,
  AgentSchedule, RetryPolicy, RunnerBindings,
} from "./types";

// Real run execution on the shared agentic kit (one agent, many slices).
export { createAgentRunner } from "./runner";
export type { AgentRunner, StartRunOpts } from "./runner";
