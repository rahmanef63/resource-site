/**
 * ai-workspace › agents variant — async autonomous worker runner + dashboard.
 *
 * `createAgentRunner(host)` drives the shared function-calling loop
 * (@/shared/agentic) against any ToolHost and records each tool_use as a
 * RunStep trace. `<AiAgentsPage />` is the run-monitoring dashboard.
 */
export { default as AiAgentsPage } from "./views/AiAgentsPage";
export type {
  AgentRun,
  RunStatus,
  RunStep,
  StepStatus,
  AgentSchedule,
  RetryPolicy,
  RunnerBindings,
} from "./types";
export { createAgentRunner } from "./runner";
export type { AgentRunner, StartRunOpts } from "./runner";
