import { query } from "../../_generated";
import { v } from "convex/values";
import type { QueryCtx } from "../../_generated";

export const settingsObject = v.object({
  _id: v.id("settings"),
  workspaceId: v.optional(v.string()),
  brandName: v.string(),
  defaultLocale: v.string(),
  heroImage: v.optional(v.string()),
  phone: v.optional(v.string()),
  email: v.optional(v.string()),
  instagram: v.optional(v.string()),
  whatsapp: v.optional(v.string()),
  logoUrl: v.optional(v.string()),
  primaryColor: v.optional(v.string()),
  secondaryColor: v.optional(v.string()),
});

export const getSettings = query({
  args: { workspaceId: v.string() },
  returns: v.union(settingsObject, v.null()),
  handler: async (ctx: QueryCtx, args: { workspaceId: string }) => {
    const settings = await ctx.db
      .query("settings")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .first();
    if (!settings) {
      return null;
    }
    return settings;
  },
});

