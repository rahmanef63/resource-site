import { v, ConvexError } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// One-click backup / restore for the owner. Exports a structured JSON snapshot
// of ALL content (NOT auth tables — never export credentials), which the owner
// downloads from the admin panel; restore wipes content and re-inserts from a
// snapshot. Data lives in Convex, so this is the owner's portable copy.

// Content tables only. Auth tables (users, authAccounts, …) are deliberately
// excluded — secrets never leave the backend. No cross-table FKs in this
// template, so restore is a flat wipe + re-insert.
const CONTENT_TABLES = [
  "kreatorContents",
  "kreatorVoices",
  "kreatorScripts",
  "kreatorCarousels",
  "kreatorAssets",
  "kreatorNewsletters",
  "kreatorPerformance",
  "kreatorComments",
  "kreatorPackages",
  "kreatorShowcase",
  "kreatorJournal",
  "kreatorTestimonials",
  "kreatorFeaturedClients",
  "kreatorMonetizationSources",
  "kreatorMonetizationMonths",
  "kreatorPayouts",
  "pages",
  "landingSections",
  "siteSettings",
] as const;

const SNAPSHOT_VERSION = 1;

export const exportAll = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new ConvexError("Harus login sebagai admin.");
    const tables: Record<string, unknown[]> = {};
    for (const t of CONTENT_TABLES) {
      tables[t] = await ctx.db.query(t).collect();
    }
    return { snapshotVersion: SNAPSHOT_VERSION, exportedAt: Date.now(), tables };
  },
});

// Strip Convex system fields so a doc can be re-inserted cleanly.
function clean<T extends Record<string, unknown>>(doc: T): Omit<T, "_id" | "_creationTime"> {
  const { _id, _creationTime, ...rest } = doc as Record<string, unknown>;
  void _id;
  void _creationTime;
  return rest as Omit<T, "_id" | "_creationTime">;
}

export const importAll = mutation({
  args: { snapshot: v.any() },
  handler: async (ctx, { snapshot }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new ConvexError("Harus login sebagai admin.");
    const tables = (snapshot?.tables ?? {}) as Record<string, Array<Record<string, unknown>>>;

    // 1. Wipe existing content (replace semantics — the owner is restoring).
    for (const t of CONTENT_TABLES) {
      const existing = await ctx.db.query(t).collect();
      for (const row of existing) await ctx.db.delete(row._id);
    }

    // 2. Re-insert (no FK remap needed for this template).
    let inserted = 0;
    for (const t of CONTENT_TABLES) {
      for (const doc of tables[t] ?? []) {
        await ctx.db.insert(t, clean(doc) as never);
        inserted++;
      }
    }

    return { ok: true as const, inserted };
  },
});
