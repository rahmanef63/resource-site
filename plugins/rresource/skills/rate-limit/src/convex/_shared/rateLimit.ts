// Vendored in plugins/rresource. Self-contained — no cross-slice imports.
// Default state = localStorage. Optional Convex schema + fns under ./convex/.

import type { ActionCtx, MutationCtx } from "../_generated/server";

const MIN_BUCKET = 10;          // 10 / minute
const DAY_BUCKET = 100;         // 100 / day
const MIN_MS = 60_000;
const DAY_MS = 86_400_000;

// Schema fragment to add to consumer's convex/schema.ts:
//
// rateLimitBuckets: defineTable({
//   userId: v.id("users"),
//   minuteCount: v.number(),
//   minuteResetAt: v.number(),
//   dayCount: v.number(),
//   dayResetAt: v.number(),
// }).index("by_user", ["userId"]),

export async function requireQuota(ctx: ActionCtx | MutationCtx): Promise<void> {
  const id = await ctx.auth.getUserIdentity();
  if (!id) throw new Error("Tidak terautentikasi");
  const u = await ctx.db.query("users")
    .withIndex("by_token", (q: any) => q.eq("tokenIdentifier", id.tokenIdentifier)).unique();
  if (!u) throw new Error("User tidak ditemukan");

  const now = Date.now();
  const existing = await ctx.db.query("rateLimitBuckets")
    .withIndex("by_user", (q: any) => q.eq("userId", u._id)).unique();

  let { minuteCount = 0, minuteResetAt = now + MIN_MS, dayCount = 0, dayResetAt = now + DAY_MS } = existing ?? {};
  if (now > minuteResetAt) { minuteCount = 0; minuteResetAt = now + MIN_MS; }
  if (now > dayResetAt) { dayCount = 0; dayResetAt = now + DAY_MS; }

  if (minuteCount >= MIN_BUCKET) throw new Error("Quota per menit terlampaui");
  if (dayCount >= DAY_BUCKET) throw new Error("Quota harian terlampaui");

  minuteCount++; dayCount++;
  if (existing) await ctx.db.patch(existing._id, { minuteCount, minuteResetAt, dayCount, dayResetAt });
  else await ctx.db.insert("rateLimitBuckets", { userId: u._id, minuteCount, minuteResetAt, dayCount, dayResetAt });
}
