/**
 * Agentic kit — the "custom instruction" half of the rr BYOK contract.
 *
 * rr is a features LIBRARY, not a deployed agent. It never holds a model key.
 * For each slice it ships exactly two things a consumer feeds to THEIR OWN
 * model call (with THEIR OWN key):
 *
 *   1. a custom instruction (system prompt)  ← this module
 *   2. a function list to call               ← `registry.anthropicTools()`
 *
 *   const system = registry.systemPrompt();     // (1)
 *   const tools  = registry.anthropicTools();    // (2)
 *   // consumer's BYOK call, e.g. Anthropic SDK with their key:
 *   anthropic.messages.create({ model, system, tools, messages });
 *
 * @module lib/shared/agentic/prompt
 */

import type { ToolCollection } from "./types";

/**
 * rr's canonical tool-calling instruction. Stable, model-agnostic, copy-safe
 * (no rr branding, no deploy assumptions). Consumers may replace it via the
 * `base` option, but the destructive-action rule pairs with the kit's
 * `dangerous` flag + the loop's `confirm` gate — keep it if you keep those.
 */
export const BASE_AGENT_SYSTEM = `You are an assistant embedded in an application. You act by calling the provided tools, each named "<namespace>.<action>".

- Prefer calling a tool over describing what you would do.
- Work one logical step at a time; read each tool_result before the next call.
- Tools described as destructive or irreversible (delete, refund, reset, role or permission changes, broadcasts) need explicit user intent — confirm before calling them.
- Never invent tool names, namespaces, or arguments outside a tool's JSON schema.
- When no tool fits the request, answer briefly in plain text.`;

/** What the prompt builder needs from a collection: its namespace + guidance. */
export type PromptCollection = Pick<ToolCollection, "namespace" | "instructions">;

/**
 * Compose the full custom instruction: the base rules followed by each
 * collection's own `instructions` block (skipped when absent). `extra` appends
 * app-specific guidance last.
 */
export function buildAgentSystem(
  collections: PromptCollection[],
  opts: { base?: string; extra?: string } = {},
): string {
  const blocks = collections
    .filter((c) => c.instructions && c.instructions.trim())
    .map((c) => `## ${c.namespace}\n${c.instructions!.trim()}`);
  return [opts.base ?? BASE_AGENT_SYSTEM, ...blocks, opts.extra?.trim()]
    .filter(Boolean)
    .join("\n\n");
}
