"use client";

/**
 * Mounts the live model bridge once: points the shared agentic seam at the
 * /api/agent-stream SSE proxy so the assistant runs the real function-calling
 * loop over every slice tool collection registered via `useAgentTools`.
 *
 * Renders nothing. Inert until someone actually chats (the route is the cost
 * gate: ANTHROPIC_API_KEY + per-IP rate limit). Set NEXT_PUBLIC_AGENT_BRIDGE=0
 * to keep the demo typing-stream even where this is mounted.
 */

import { useEffect } from "react";
import { configureAgentStream, isAgentStreamConfigured, createSseAgentStream } from "@/shared/agentic";

export function AgentBridge() {
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_AGENT_BRIDGE === "0") return;
    if (!isAgentStreamConfigured()) configureAgentStream(createSseAgentStream());
  }, []);
  return null;
}
