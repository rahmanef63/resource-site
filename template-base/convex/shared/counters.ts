import type { Id } from "../_generated/dataModel"

/**
 * Monotonic per-workspace counter helper.
 *
 * Call sites previously used `(await ctx.db.query("<table>").collect()).length + 1`
 * to mint human-readable IDs (EMP-0042, INV-000123, TICKET-000007, …). That
 * pattern has three correctness issues:
 *  1. Deleting any row reuses the removed ID on the next create (collision).
 *  2. Under `.take(N)` caps, the counter silently stops incrementing once
 *     the row count exceeds the cap.
 *  3. The full-table read is O(n) per create.
 *
 * This helper keeps a single row per (workspaceId, counterType) in the
 * `workspaceCounters` table and atomically increments it. First use for
 * a given counter type can optionally seed from an existing row count so
 * workspaces with historical data don't restart at 1.
 *
 * Convex mutations are serialized per document; this read-increment-write
 * pair is therefore race-free within a single workspace counter.
 */
export async function nextCounterValue(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ctx: any,
  workspaceId: Id<"workspaces">,
  counterType: string,
  opts?: {
    /**
     * Called once to seed the counter when no row exists yet for this
     * (workspace, counterType). Returns the highest used value — the
     * counter starts at `seed() + 1`. Default is 0.
     */
    seed?: () => Promise<number>
  },
): Promise<number> {
  const existing = await ctx.db
    .query("workspaceCounters")
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .withIndex("by_workspace_type", (q: any) =>
      q.eq("workspaceId", workspaceId).eq("counterType", counterType),
    )
    .first()

  if (existing) {
    const next = existing.currentValue + 1
    await ctx.db.patch(existing._id, {
      currentValue: next,
      updatedAt: Date.now(),
    })
    return next
  }

  const seedBase = opts?.seed ? await opts.seed() : 0
  const first = seedBase + 1
  await ctx.db.insert("workspaceCounters", {
    workspaceId,
    counterType,
    currentValue: first,
    updatedAt: Date.now(),
  })
  return first
}

export function formatCounter(
  prefix: string,
  value: number,
  width: number,
): string {
  return `${prefix}-${String(value).padStart(width, "0")}`
}
