import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const ROLE = v.union(
  v.literal("PI"),
  v.literal("co-author"),
  v.literal("advisor"),
  v.literal("RA"),
  v.literal("external"),
);

export const list = query({
  args: {},
  handler: async (ctx) => ctx.db.query("risetCollaborators").take(200),
});

export const upsert = mutation({
  args: {
    id: v.optional(v.id("risetCollaborators")),
    name: v.string(),
    affiliation: v.string(),
    role: ROLE,
    orcid: v.string(),
    email: v.string(),
    expertise: v.array(v.string()),
    projectIds: v.array(v.string()),
    initials: v.string(),
  },
  handler: async (ctx, { id, ...data }) => {
    if (id) {
      await ctx.db.patch(id, data);
      return id;
    }
    return ctx.db.insert("risetCollaborators", data);
  },
});

export const remove = mutation({
  args: { id: v.id("risetCollaborators") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});
