/** Public types for ai-agent-runner slice. */

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

export type RunnerBindings = {
  listRuns: unknown;
  getRun: unknown;
  startRun: unknown;
  cancelRun: unknown;
};
