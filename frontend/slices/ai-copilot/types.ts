/** Public types for ai-copilot slice. */

export type EntityKind = "pr" | "doc" | "email" | "code-file" | "task" | string;

export type EntityContext = {
  kind: EntityKind;
  id: string;
  /** Optional summary the host app provides — fed into prompt context. */
  summary?: string;
  /** Optional structured fields (record values, etc). */
  fields?: Record<string, unknown>;
};

export type CopilotSuggestion = {
  id: string;
  label: string;
  hint?: string;
  prompt: string;
  /** Optional icon name from lucide. */
  icon?: string;
};

export type CopilotTrigger = {
  entityKind: EntityKind;
  suggestions: CopilotSuggestion[];
  enabled: boolean;
};

export type CopilotBindings = {
  ask: unknown;
  suggestionsForEntity: unknown;
  acceptSuggestion: unknown;
};
