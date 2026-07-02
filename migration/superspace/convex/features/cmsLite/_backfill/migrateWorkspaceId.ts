import { internalMutation } from "../_generated";
import { v } from "convex/values";

/**
 * One-off backfill: assign workspaceId to legacy cmsLite rows that pre-date
 * the multi-tenant migration. Run once per environment via:
 *   npx convex run cmsLite/_backfill/migrateWorkspaceId:run --workspaceId="ws_..."
 *
 * After all environments are migrated, this file and the legacy-undefined
 * branch in assertDocWorkspace can be removed and the schema field flipped
 * from v.optional(v.string()) to v.string().
 */
export const run = internalMutation({
  args: { workspaceId: v.id("workspaces"), dryRun: v.optional(v.boolean()) },
  handler: async (ctx, args) => {
    // M1 fix (security review 2026-05-14): narrow workspaceId from v.string()
    // to v.id("workspaces") + verify the workspace exists before we stamp
    // every orphan row with it. Catches typos and prevents data corruption
    // from a misrouted backfill.
    const ws = await ctx.db.get(args.workspaceId);
    if (!ws) {
      throw new Error("workspaceId does not exist");
    }

    const tables = [
      "products",
      "productRevisions",
      "services",
      "posts",
      "postRevisions",
      "settings",
    ] as const;
    const results: Record<string, { found: number; patched: number }> = {};

    // @dod:skip-perf reason="one-off backfill — sequential table scans + sequential patches are intentional for safe per-row claim audit trail"
    for (const table of tables) {
      // @dod:skip-no-any reason="backfill helper across heterogeneous tables"
      const rows = await ctx.db.query(table as any).take(1000);
      // @dod:skip-no-any reason="backfill helper across heterogeneous tables"
      const orphans = rows.filter((r: any) => !r.workspaceId);
      results[table] = { found: orphans.length, patched: 0 };
      if (args.dryRun) continue;
      // @dod:skip-perf reason="one-off backfill — keep sequential for predictable Convex transaction sizing"
      for (const row of orphans) {
        // @dod:skip-no-any reason="backfill helper across heterogeneous tables"
        await ctx.db.patch(row._id, { workspaceId: args.workspaceId } as any);
        results[table].patched++;
      }
    }

    return results;
  },
});
