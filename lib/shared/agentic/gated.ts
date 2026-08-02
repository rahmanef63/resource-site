/**
 * Agentic kit — optional RBAC wrapper (defense-in-depth).
 *
 * The PRIMARY authorization gate for an admin tool is its consumer-supplied
 * ctx binding: the `ctx` methods (e.g. `setRole`, `refund`) hit a backend that
 * runs `requirePermission` server-side. `requirePerm` adds a SECOND fence at
 * the tool layer so a mis-wired binding can't silently expose a privileged
 * action to the agent — wrap the collection's tools at registration time with
 * a ctx that also answers `can(perm)`:
 *
 *   register(
 *     defineToolCollection({
 *       namespace: "user-management",
 *       tools: userManagementTools.tools.map((t) => requirePerm("members.manage", t)),
 *     }),
 *     () => ({ ...binding, can }),
 *   );
 *
 * Preserves every other field (name, description, parameters, `dangerous`).
 * The registry converts the thrown error into a model-readable `ok:false`
 * outcome, so the agent sees the denial and can explain it.
 *
 * @module lib/shared/agentic/gated
 */

import type { Tool } from "./types";

/** Ctx shape `requirePerm` needs: a synchronous permission check. */
export type CanCtx = { can: (perm: string) => boolean };

export function requirePerm<Ctx extends CanCtx>(perm: string, tool: Tool<Ctx>): Tool<Ctx> {
  return {
    ...tool,
    run: (ctx, args) => {
      if (!ctx.can(perm)) throw new Error(`permission denied: ${perm}`);
      return tool.run(ctx, args);
    },
  };
}
