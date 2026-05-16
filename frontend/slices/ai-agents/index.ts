/**
 * ai-agents slice — public barrel.
 *
 * Async autonomous worker dashboard. Mount `<RunnerDashboard />` at
 * /agents. Trigger runs via `runAgent({agentSlug, input, scheduleAt?})`.
 *
 *   import { RunnerDashboard, useAgentRuns } from "@/features/ai-agents";
 *
 * Status: scaffold (0.1.0). Real impl pending. UX target at
 * /preview/slices/ai-agents.
 */

export type {
  AgentRun, RunStatus, RunStep, StepStatus,
  AgentSchedule, RetryPolicy, RunnerBindings,
} from "./types";
