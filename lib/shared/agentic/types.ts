/**
 * Agentic kit — shared type vocabulary.
 *
 * Core idea: a slice is NOT an agent. A slice exports a {@link ToolCollection}
 * — a bag of agent-agnostic function-calling tools. ONE agent (the shared
 * {@link runAgentLoop}) aggregates collections from many slices via a
 * {@link ToolHost} and drives them. The agent already speaks function calling;
 * each slice only declares WHAT it can do and HOW to run it.
 *
 * @module lib/shared/agentic/types
 */

/** A flat JSON-Schema object — Anthropic tool `input_schema` shape. */
export type JsonSchema = {
  type: "object";
  properties: Record<string, unknown>;
  required?: string[];
  additionalProperties?: boolean;
};

/**
 * One AI-callable operation. Agent-agnostic: `Ctx` (the live slice state) is
 * injected per-call by the host at register time, never by the model. `run`
 * returns a short serialisable string the model reads as the tool_result;
 * throw on bad input — the registry reports the message back to the model.
 */
export type Tool<Ctx = unknown> = {
  /** Action name, e.g. `"layer.add"`. Namespaced to `"<namespace>.<name>"` on register. */
  name: string;
  description: string;
  parameters: JsonSchema;
  /**
   * Marks a mutating / irreversible action (delete, refund, reset, role change).
   * Hosts MAY require a confirmation gate before invoking — see the optional
   * `confirm` event on {@link runAgentLoop}. Not a trust boundary on its own:
   * RBAC + secrets still live in the consumer-supplied ctx binding.
   */
  dangerous?: boolean;
  run: (ctx: Ctx, args: Record<string, unknown>) => string | Promise<string>;
};

/**
 * A slice's tool surface. `namespace` MUST equal the slice slug so tool names
 * are globally unique once prefixed (`image-editor.layer.add`). Optional
 * `describe` gives the model a compact read-back of current state.
 */
export type ToolCollection<Ctx = unknown> = {
  namespace: string;
  tools: Tool<Ctx>[];
  describe?: (ctx: Ctx) => string;
  /**
   * Static usage guidance for THIS collection's tools — the slice's slice of
   * the agent's custom instruction. Composed into the system prompt by
   * `buildAgentSystem` / `registry.systemPrompt()`. Distinct from `describe`,
   * which is dynamic per-call state read-back.
   */
  instructions?: string;
};

/** Anthropic `tools[]` wire shape (derived from a {@link Tool}). */
export type AnthropicTool = {
  name: string;
  description: string;
  input_schema: JsonSchema;
};

export type ToolUse = { id: string; name: string; input: Record<string, unknown> };

export type AgentMsg =
  | { role: "user"; text: string }
  | { role: "assistant"; text?: string; toolUses?: ToolUse[] }
  | { role: "tool"; results: { id: string; content: string; isError?: boolean }[] };

export type AgentTurn = { text: string; toolUses: ToolUse[]; stopReason: string | null };

/** Result of running one tool — `ok:false` carries the error message for the model. */
export type ToolOutcome = { ok: boolean; result: string };

/**
 * What the agent loop needs from a tool source. The registry implements this;
 * any slice that already binds {tools, invoke} to live state can adapt to it
 * without going through the registry.
 */
export interface ToolHost {
  /** The Anthropic `tools[]` array sent to the model. */
  anthropicTools(): AnthropicTool[];
  /** Run a (fully-qualified) tool by name against its bound context. */
  invoke(name: string, input: Record<string, unknown>): Promise<ToolOutcome>;
  /** Whether a (fully-qualified) tool is flagged `dangerous`. Drives the loop's confirm gate. */
  isDangerous?(name: string): boolean;
}
