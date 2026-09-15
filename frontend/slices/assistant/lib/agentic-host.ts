// Central host plumbing — assistant is the aggregation point. Slices register
// ToolCollections against the shared global registry; both React and Svelte
// assistant renderers drive that same registry through the shared agent loop.

import {
  globalToolRegistry,
  registerGlobalTools,
} from "@/shared/agentic/global-host";
import type { ToolCollection } from "@/shared/agentic/types";
import type { ToolRegistry } from "@/shared/agentic/registry";

export function getAssistantRegistry(): ToolRegistry {
  return globalToolRegistry();
}

export function registerAssistantTools<Ctx>(
  collection: ToolCollection<Ctx>,
  getCtx: () => Ctx,
): void {
  registerGlobalTools(collection, getCtx);
}
