"use client";

/**
 * Agentic kit — mount-time host wiring as a one-line React hook.
 *
 *   const files = useFiles(...);
 *   useAgentTools(fileExplorerTools, files);
 *
 * Registers the collection on the global host bound to the component's
 * LIVE state: the ctx is read through a ref updated every render, so tools
 * always see current values; remounts rebind via registerGlobalTools.
 *
 * @module lib/shared/agentic/use-agent-tools
 */

import { useEffect, useRef } from "react";

import { registerGlobalTools } from "./global-host";
import type { ToolCollection } from "./types";

export function useAgentTools<Ctx>(
  collection: ToolCollection<Ctx>,
  ctx: Ctx,
): void {
  const ref = useRef(ctx);
  ref.current = ctx;
  useEffect(() => {
    registerGlobalTools(collection, () => ref.current);
  }, [collection]);
}
