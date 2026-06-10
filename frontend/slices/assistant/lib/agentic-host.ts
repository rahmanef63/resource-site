"use client";

// Central host plumbing — the assistant is THE aggregation point. Hosts
// register each installed slice's ToolCollection here once; the chat then
// drives the union of all registered tools through the ONE shared agent
// loop (@/shared/agentic). A slice is never an agent — it only contributes
// a collection of function-calling tools bound to its own live state.

import {
  createToolRegistry,
  type ToolCollection,
  type ToolRegistry,
} from "@/shared/agentic";

const registry: ToolRegistry = createToolRegistry();
const registered = new Set<string>();

/** The assistant-wide registry (a ToolHost) the chat loop runs against. */
export function getAssistantRegistry(): ToolRegistry {
  return registry;
}

/**
 * Host wiring: register a slice's tool collection (e.g. `imageEditorTools`)
 * with a thunk returning its live ctx. Idempotent per namespace, so calling
 * from a React effect (strict-mode double mount) is safe.
 */
export function registerAssistantTools<Ctx>(
  collection: ToolCollection<Ctx>,
  getCtx: () => Ctx,
): void {
  if (registered.has(collection.namespace)) return;
  registered.add(collection.namespace);
  registry.register(collection, getCtx);
}
