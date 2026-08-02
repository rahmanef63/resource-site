/** Public types for ai-agents slice. */

export type RunStatus = "queued" | "running" | "success" | "failed";
export type StepStatus = "pending" | "running" | "done" | "error";

export type RunStep = {
  index: number;
  name: string;
  args?: string;
  result?: string;
  status: StepStatus;
  startedAt?: number;
  finishedAt?: number;
};

export type AgentRun = {
  id: string;
  workspaceId: string;
  agentSlug: string;
  input: string;
  status: RunStatus;
  steps: RunStep[];
  costUsd?: number;
  latencyMs?: number;
  scheduleAt?: number;
  startedAt?: number;
  finishedAt?: number;
};

export type AgentSchedule = {
  agentSlug: string;
  cron: string;
  description?: string;
  active: boolean;
};

export type RetryPolicy = {
  attempts: number;
  /** ms baseline; exponential backoff is `base * 2^attempt`. */
  backoffMs: number;
};

// Typed runner surface — implemented for real by createAgentRunner (runner.ts)
// on the shared agentic kit; a Convex-backed host can satisfy the same shape.
export type RunnerBindings = {
  listRuns: () => AgentRun[];
  getRun: (id: string) => AgentRun | undefined;
  startRun: (input: string, opts?: { agentSlug?: string }) => Promise<AgentRun>;
  cancelRun?: (id: string) => void;
};
