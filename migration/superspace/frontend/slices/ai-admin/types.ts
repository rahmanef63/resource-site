/** Public types for ai-admin slice. */

export type ProviderStatus = "connected" | "error" | "missing-key";

export type AIProvider = {
  slug: string;
  name: string;
  baseUrl: string;
  status: ProviderStatus;
  lastTestedAt?: number;
};

export type ModelCapability = "vision" | "tools" | "long-context" | "fast" | "reasoning";

export type AIModel = {
  id: string;
  providerSlug: string;
  displayName: string;
  capabilities: ModelCapability[];
  contextWindow: number;
  pricing: { inputPerMtok: number; outputPerMtok: number };
  active: boolean;
};

export type AISkill = {
  slug: string;
  name: string;
  systemPrompt: string;
  modelDefault: string;
  toolDefaults: string[];
};

export type AITool = {
  slug: string;
  name: string;
  description?: string;
  jsonSchema: Record<string, unknown>;
  impl: "http" | "convex" | "shell" | "local";
  endpoint?: string;
  sandboxed: boolean;
};

export type AIAgent = {
  slug: string;
  name: string;
  skillSlug: string;
  modelId: string;
  toolSlugs: string[];
  maxIter: number;
  status: "active" | "paused" | "draft";
};

export type Budget = {
  workspaceId: string;
  dailyUsd?: number;
  monthlyUsd?: number;
  hardCap?: number;
};

export type AuditEntry = {
  id: string;
  workspaceId: string;
  actor: string;
  agentSlug?: string;
  modelId: string;
  inputTokens: number;
  outputTokens: number;
  costUsd: number;
  latencyMs: number;
  outcome: "ok" | "error" | "blocked";
  createdAt: number;
};
