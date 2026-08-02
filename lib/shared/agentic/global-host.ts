/**
 * Agentic kit — the module-singleton GLOBAL host.
 *
 * Slices may import `@/shared/agentic` (allowed prefix), so any slice's app
 * component can self-register its {@link ToolCollection} at mount — no
 * cross-slice import, no prop threading through host pages. The assistant
 * (or any other agent UI) then drives this one registry.
 *
 * Re-registering a namespace REPLACES its ctx getter instead of skipping:
 * an app that unmounts and remounts binds the registry to its NEW live
 * state rather than a stale closure. Tools themselves register once.
 *
 * @module lib/shared/agentic/global-host
 */

import { createToolRegistry, type ToolRegistry } from "./registry";
import type { ToolCollection } from "./types";

const registry: ToolRegistry = createToolRegistry();
const ctxGetters = new Map<string, () => unknown>();

/** The app-wide registry (a ToolHost) agent UIs run against. */
export function globalToolRegistry(): ToolRegistry {
  return registry;
}

/**
 * Register a slice's tool collection bound to a thunk resolving its live
 * ctx. Safe to call repeatedly (React strict-mode, remounts): the first
 * call registers the tools through a forwarding thunk; later calls only
 * swap which ctx the thunk resolves to.
 */
export function registerGlobalTools<Ctx>(
  collection: ToolCollection<Ctx>,
  getCtx: () => Ctx,
): void {
  const ns = collection.namespace;
  const fresh = !ctxGetters.has(ns);
  ctxGetters.set(ns, getCtx as () => unknown);
  if (fresh) {
    registry.register(collection, () => {
      const get = ctxGetters.get(ns);
      if (!get) throw new Error(`agentic: namespace "${ns}" unregistered`);
      return get() as Ctx;
    });
  }
}
