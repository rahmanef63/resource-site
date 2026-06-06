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
export type WireMsg = { role: "user" | "assistant"; text: string };
export type AssistantStreamFn = (messages: WireMsg[]) => AsyncIterable<string>;

/** Offline demo stream: types out a canned reply so the UI works unwired. */
async function* demoStream(messages: WireMsg[]): AsyncIterable<string> {
  const last = messages[messages.length - 1]?.text ?? "";
  const reply =
    `Demo mode — no model is wired yet. You said: “${last.slice(0, 120)}”. ` +
    "Connect a real LLM with configureAssistantStream(fn): point it at your " +
    "SSE endpoint or any async generator that yields text deltas.";
  for (const word of reply.split(/(?<= )/)) {
    await new Promise((r) => setTimeout(r, 24));
    yield word;
  }
}

let impl: AssistantStreamFn = demoStream;

/** Host wiring: stream real model replies (SSE endpoint, AI SDK, agent…). */
export function configureAssistantStream(fn: AssistantStreamFn): void {
  impl = fn;
}

export function streamReply(messages: WireMsg[]): AsyncIterable<string> {
  return impl(messages);
}
