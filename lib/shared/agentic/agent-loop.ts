/**
 * Agentic kit — the ONE shared agent loop.
 *
 * Drives a function-calling conversation over ANY {@link ToolHost} (the
 * registry, or a slice's own bound {tools, invoke}). It does not know or care
 * which slice a tool belongs to: stream a turn → run every `tool_use` locally
 * via `host.invoke` → feed the results back → repeat until the model stops
 * calling tools or the turn cap is hit. Returns the extended history so the
 * caller can keep the thread going.
 *
 * This replaces per-slice agent loops (image-editor's `runEditorAgent`, the
 * assistant's bespoke streamer): there is now exactly one loop.
 *
 * @module lib/shared/agentic/agent-loop
 */

import { streamAgentTurn } from "./host";
import type { AgentMsg, ToolHost, ToolOutcome } from "./types";

export type AgentEvents = {
  /** Streaming text deltas for the current assistant turn. */
  onDelta?: (chunk: string) => void;
  /** A tool the model called, with the local execution outcome. */
  onTool?: (name: string, input: Record<string, unknown>, outcome: ToolOutcome) => void;
  /**
   * Confirmation gate for `dangerous` tools. Called BEFORE a tool the host
   * flags dangerous runs; return false to decline — the model gets a
   * `denied`-error tool_result and the action never executes. Omit to run
   * dangerous tools unguarded (back-compat default).
   */
  confirm?: (name: string, input: Record<string, unknown>) => boolean | Promise<boolean>;
};

export async function runAgentLoop(
  history: AgentMsg[],
  host: ToolHost,
  ev: AgentEvents = {},
  maxTurns = 8,
): Promise<{ history: AgentMsg[]; text: string }> {
  const msgs = [...history];
  const tools = host.anthropicTools();
  let lastText = "";

  for (let i = 0; i < maxTurns; i++) {
    const { text, toolUses } = await streamAgentTurn(
      msgs,
      tools,
      (c) => ev.onDelta?.(c),
    );
    msgs.push({ role: "assistant", text, toolUses });
    if (text) lastText = text;
    if (toolUses.length === 0) break;

    const results = [];
    for (const tu of toolUses) {
      if (ev.confirm && host.isDangerous?.(tu.name)) {
        const ok = await ev.confirm(tu.name, tu.input);
        if (!ok) {
          const outcome: ToolOutcome = { ok: false, result: `denied: "${tu.name}" requires confirmation and was declined` };
          ev.onTool?.(tu.name, tu.input, outcome);
          results.push({ id: tu.id, content: outcome.result, isError: true });
          continue;
        }
      }
      const outcome = await host.invoke(tu.name, tu.input);
      ev.onTool?.(tu.name, tu.input, outcome);
      results.push({ id: tu.id, content: outcome.result, isError: !outcome.ok });
    }
    msgs.push({ role: "tool", results });
  }

  return { history: msgs, text: lastText };
}
