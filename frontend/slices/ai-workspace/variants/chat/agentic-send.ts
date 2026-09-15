// Bridge: shared agentic kit → AiChatSend. Give the FAB real function
// calling by passing it a send built over any ToolHost (e.g. a
// createToolRegistry() aggregating many slices' tool collections):
//
//   <AiChatFab chat={createAgenticChatSend(registry)} />
//
// Requires the shared model seam (configureAgentStream) to be wired.

import { runAgentLoop } from "@/shared/agentic/agent-loop";
import type { AgentMsg, ToolHost } from "@/shared/agentic/types";
import type { AiChatSend } from "./core";

export function createAgenticChatSend(
  host: ToolHost,
  opts: { maxTurns?: number } = {},
): AiChatSend {
  return async ({ prompt, history }) => {
    const msgs: AgentMsg[] = [
      ...history.map((h) => ({ role: h.role, text: h.content })),
      { role: "user" as const, text: prompt },
    ];
    try {
      const { text } = await runAgentLoop(msgs, host, {}, opts.maxTurns ?? 6);
      return { ok: true, text };
    } catch (e) {
      return { ok: false, notice: e instanceof Error ? e.message : String(e) };
    }
  };
}
