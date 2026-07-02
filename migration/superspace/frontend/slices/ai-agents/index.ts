/**
 * ai-agents slice — public barrel.
 *
 * Autonomous worker runner surface. Trigger runs via createAgentRunner(host).
 *
 *   import { createAgentRunner } from "@/frontend/slices/ai-agents";
 *
 * Status: 0.1.0 NON-FUNCTIONAL SCAFFOLD (adopted alongside the existing AI
 * engine at convex/features/ai). createAgentRunner(host) preserves the upstream
 * runner shape but the shared function-calling loop (rr `@/shared/agentic`,
 * absent in superspace) is stubbed locally in runner.ts — no provider/SDK call
 * is made. Dashboard UI at /dashboard/ai-agents (views/AiAgentsPage.tsx).
 */

export type {
  AgentRun, RunStatus, RunStep, StepStatus,
  AgentSchedule, RetryPolicy, RunnerBindings,
} from "./types";

// Runner surface (scaffold): drives a locally-stubbed agentic loop — no LLM call.
export { createAgentRunner } from "./runner";
export type { AgentRunner, StartRunOpts } from "./runner";
