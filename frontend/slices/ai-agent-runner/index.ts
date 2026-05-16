/**
 * ai-agent-runner slice — public barrel.
 *
 * Async autonomous worker dashboard. Mount `<RunnerDashboard />` at
 * /agents. Trigger runs via `runAgent({agentSlug, input, scheduleAt?})`.
 *
 *   import { RunnerDashboard, useAgentRuns } from "@/features/ai-agent-runner";
 *
 * Status: scaffold (0.1.0). Real impl pending. UX target at
 * /preview/slices/ai-agent-runner.
 */

export type {
  AgentRun, RunStatus, RunStep, StepStatus,
  AgentSchedule, RetryPolicy, RunnerBindings,
} from "./types";
