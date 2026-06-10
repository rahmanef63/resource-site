"use client";

// Single integration seam between this slice and the host app. In the rr
// catalog build the slice is SELF-CONTAINED: agents/skills/automations live
// in localStorage, the inspector bus is a no-op, and replies come from a
// DEMO stream until the host wires a real LLM with configureAssistantStream
// (point it at your SSE endpoint, the AI SDK, or any async generator).

import type { ComponentType } from "react";
import type { LucideIcon } from "lucide-react";

// ── Shell inspector bus — inert outside a shell ────────────────────────────
export type InspectorProp = { label: string; value: string };
export type InspectorAction = { id: string; label: string; run: () => void };
export type InspectorInfo = {
  subject?: string;
  props?: InspectorProp[];
  actions?: InspectorAction[];
  context?: string;
  suggestions?: string[];
};

export function usePublishInspector(_appId: string, _info: InspectorInfo, _deps: unknown[]): void {}

// ── App descriptor (appshell-compatible; minimal fields the barrel uses) ───
export type AppDescriptor = {
  id: string;
  slug?: string;
  title: string;
  icon: LucideIcon;
  gradient: string;
  load: () => Promise<{ default: ComponentType }>;
  defaultSize?: { w: number; h: number };
};

// ── LLM stream adapter ──────────────────────────────────────────────────────
// The model seam is the SHARED one (@/shared/agentic). Wire it once with
// configureAgentStream and the chat runs the real function-calling loop over
// every registered slice tool collection. streamReply stays as the offline
// demo used only while the seam is unconfigured.
import { configureAgentStream } from "@/shared/agentic";

export { configureAgentStream, isAgentStreamConfigured } from "@/shared/agentic";
export type { AgentStreamFn } from "@/shared/agentic";

export type WireMsg = { role: "user" | "assistant"; text: string };
export type AssistantStreamFn = (messages: WireMsg[]) => AsyncIterable<string>;

/** Offline demo stream: types out a canned reply so the UI works unwired. */
async function* demoStream(messages: WireMsg[]): AsyncIterable<string> {
  const last = messages[messages.length - 1]?.text ?? "";
  const reply =
    `Demo mode — no model is wired yet. You said: “${last.slice(0, 120)}”. ` +
    "Connect a real LLM with configureAgentStream(fn) from @/shared/agentic " +
    "(function calling) or configureAssistantStream(fn) (text-only).";
  for (const word of reply.split(/(?<= )/)) {
    await new Promise((r) => setTimeout(r, 24));
    yield word;
  }
}

/**
 * @deprecated Text-only adapter kept for back-compat. It funnels into the
 * shared seam (no tool use). Prefer configureAgentStream from @/shared/agentic.
 */
export function configureAssistantStream(fn: AssistantStreamFn): void {
  configureAgentStream(async (messages, _tools, onDelta) => {
    const wire: WireMsg[] = [];
    for (const m of messages) {
      if (m.role === "user") wire.push({ role: "user", text: m.text });
      else if (m.role === "assistant" && m.text)
        wire.push({ role: "assistant", text: m.text });
    }
    let text = "";
    for await (const delta of fn(wire)) {
      text += delta;
      onDelta(delta);
    }
    return { text, toolUses: [], stopReason: "end_turn" };
  });
}

export function streamReply(messages: WireMsg[]): AsyncIterable<string> {
  return demoStream(messages);
}
