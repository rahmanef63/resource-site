// Bridge STUB — the shared agentic kit (`@/shared/agentic`) is NOT part of
// superspace, so this scaffold ships a non-functional passthrough. The original
// rr version wrapped `runAgentLoop(...)` over a ToolHost to give the FAB real
// function-calling; that glue is intentionally omitted for the adopted-alongside
// scaffold. Wire a real backend via the FAB's `chat` prop instead — e.g.
// `useAction(api.features.aiRouter.action.callModel)`.

import type { AiChatSend } from "./components/AiChatFab";

// Minimal local shape kept so the public barrel signature stays stable
// (the original imported `ToolHost` from `@/shared/agentic`).
export type ToolHost = unknown;

export function createAgenticChatSend(
  _host: ToolHost,
  _opts: { maxTurns?: number } = {},
): AiChatSend {
  return async () => ({
    ok: false,
    notice:
      "Agentic tool-calling (@/shared/agentic) is not wired in this build. Inject a `chat` prop to enable replies.",
  });
}
