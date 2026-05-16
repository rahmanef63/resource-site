/** Public types shared by ChatWorkbench + bindings consumers. */

export type ChatRole = "user" | "assistant" | "system" | "tool";

export type ChatMessage = {
  id: string;
  threadId: string;
  role: ChatRole;
  content: ChatContentBlock[];
  toolCalls?: ChatToolCall[];
  citations?: ChatCitation[];
  streamedAt?: number;
  finishedAt?: number;
};

export type ChatContentBlock =
  | { kind: "text"; text: string }
  | { kind: "image"; storageId: string; mime: string }
  | { kind: "file"; storageId: string; name: string; mime: string; sizeBytes: number };

export type ChatToolCall = {
  name: string;
  args: string;
  result?: string;
  status: "running" | "done" | "error";
};

export type ChatCitation = { label: string; href?: string };

export type ChatThread = {
  id: string;
  workspaceId: string;
  userId: string;
  title: string;
  modelId: string;
  systemPromptId?: string;
  branchedFrom?: string;
  archived: boolean;
  createdAt: number;
};

export type ChatModel = {
  id: string;
  providerSlug: string;
  displayName: string;
  capabilities: ("vision" | "tools" | "long-context" | "fast" | "reasoning")[];
  contextWindow: number;
  pricing?: { inputPerMtok: number; outputPerMtok: number };
};

export type ChatTool = {
  slug: string;
  name: string;
  description?: string;
  jsonSchema: Record<string, unknown>;
  sandboxed: boolean;
};

export type ChatSkill = {
  slug: string;
  name: string;
  systemPrompt: string;
  modelDefault: string;
  toolDefaults: string[];
};
