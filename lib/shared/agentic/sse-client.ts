/**
 * Agentic kit — browser-side {@link AgentStreamFn} backed by the SSE proxy at
 * /api/agent-stream. POSTs the shared history + tool schemas, streams text
 * deltas through `onDelta`, and resolves the final {@link AgentTurn} (text +
 * toolUses) the agent loop dispatches against the registry.
 *
 * Zero React, zero slice imports — a host calls it once:
 *   configureAgentStream(createSseAgentStream())
 *
 * @module lib/shared/agentic/sse-client
 */

import type { AgentStreamFn } from "./host";
import type { AgentTurn } from "./types";

export function createSseAgentStream(
  url = "/api/agent-stream",
  /**
   * BYOK custom instruction sent as `system` in the request body — pass
   * `() => globalToolRegistry().systemPrompt()` so the prompt reflects
   * whatever collections are registered at call time. Omitted → the route's
   * own default system prompt applies.
   */
  system?: string | (() => string),
): AgentStreamFn {
  return async (messages, tools, onDelta) => {
    const sys = typeof system === "function" ? system() : system;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(sys ? { messages, tools, system: sys } : { messages, tools }),
    });
    if (res.status === 429) throw new Error("rate_limited");
    if (!res.ok || !res.body) throw new Error(`agent stream HTTP ${res.status}`);

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buf = "";
    let turn: AgentTurn = { text: "", toolUses: [], stopReason: null };

    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += decoder.decode(value, { stream: true });
      let nl: number;
      while ((nl = buf.indexOf("\n\n")) !== -1) {
        const frame = buf.slice(0, nl);
        buf = buf.slice(nl + 2);
        const data = frame.split("\n").find((l) => l.startsWith("data:"));
        if (!data) continue;
        const json = data.slice(5).trim();
        if (!json) continue;
        const evt = JSON.parse(json) as
          | { type: "delta"; text: string }
          | { type: "turn"; turn: AgentTurn };
        if (evt.type === "delta") onDelta(evt.text);
        else if (evt.type === "turn") turn = evt.turn;
      }
    }
    return turn;
  };
}
