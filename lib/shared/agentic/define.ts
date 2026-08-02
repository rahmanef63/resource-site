/**
 * Agentic kit — identity factories.
 *
 * `defineTool` / `defineToolCollection` are identity functions that exist
 * purely for type inference + a stable authoring surface (so slices write
 * `export const fooTools = defineToolCollection({ … })` and get `Ctx`
 * inferred across every `run`).
 *
 * @module lib/shared/agentic/define
 */

import type { Tool, ToolCollection } from "./types";

export function defineTool<Ctx>(t: Tool<Ctx>): Tool<Ctx> {
  return t;
}

export function defineToolCollection<Ctx>(c: ToolCollection<Ctx>): ToolCollection<Ctx> {
  return c;
}
