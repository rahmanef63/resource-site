"use client";

// Central host plumbing — the assistant is THE aggregation point. Hosts
// register each installed slice's ToolCollection here once; the chat then
// drives the union of all registered tools through the ONE shared agent
// loop (@/shared/agentic). A slice is never an agent — it only contributes
// a collection of function-calling tools bound to its own live state.

import {
  globalToolRegistry,
  registerGlobalTools,
  type ToolCollection,
  type ToolRegistry,
} from "@/shared/agentic";

/**
 * The assistant-wide registry (a ToolHost) the chat loop runs against.
 * This IS the shared global host — apps that self-register at mount via
 * `useAgentTools` (any slice may import `@/shared/agentic`) land here too.
 */
export function getAssistantRegistry(): ToolRegistry {
  return globalToolRegistry();
}

/**
 * Host wiring: register a slice's tool collection (e.g. `imageEditorTools`)
 * with a thunk returning its live ctx. Safe in React effects (strict-mode
 * double mount); re-registering a namespace rebinds its ctx getter.
 */
export function registerAssistantTools<Ctx>(
  collection: ToolCollection<Ctx>,
  getCtx: () => Ctx,
): void {
  registerGlobalTools(collection, getCtx);
}
