/**
 * Agentic kit — the model seam (the ONE place a backend is wired).
 *
 * Slices never talk to a model. The host app calls {@link configureAgentStream}
 * once at startup to provide a single-turn streaming function (an SSE route,
 * the Vercel AI SDK, the Anthropic SDK, any async generator). Until wired,
 * {@link streamAgentTurn} throws a friendly "not configured" error — every
 * non-AI slice feature keeps working.
 *
 * Lifted from the image-editor slice's private seam so there is exactly one
 * model-wiring surface across all agentic slices (was: one per slice).
 *
 * @module lib/shared/agentic/host
 */

import type { AgentMsg, AgentTurn, AnthropicTool } from "./types";

export type AgentStreamFn = (
  messages: AgentMsg[],
  tools: AnthropicTool[],
  onDelta: (chunk: string) => void,
) => Promise<AgentTurn>;

let configured = false;

let impl: AgentStreamFn = async () => {
  throw new Error(
    "agentic: AI bridge not configured — call configureAgentStream(fn) at app " +
      "startup to wire your backend (SSE route, AI SDK, Anthropic SDK…).",
  );
};

/** Host wiring: provide the one-turn agent stream implementation. */
export function configureAgentStream(fn: AgentStreamFn): void {
  impl = fn;
  configured = true;
}

/** True once a real backend has been wired (guard before showing AI UI). */
export function isAgentStreamConfigured(): boolean {
  return configured;
}

export const streamAgentTurn: AgentStreamFn = (messages, tools, onDelta) =>
  impl(messages, tools, onDelta);
