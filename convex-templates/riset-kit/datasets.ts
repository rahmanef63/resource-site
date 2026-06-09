import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const FORMAT = v.union(
  v.literal("csv"),
  v.literal("json"),
  v.literal("parquet"),
  v.literal("xlsx"),
  v.literal("geojson"),
  v.literal("sav"),
);

export const list = query({
  args: {},
  handler: async (ctx) =>
    ctx.db.query("risetDatasets").withIndex("by_lastUpdated").order("desc").take(200),
});

export const upsert = mutation({
  args: {
    id: v.optional(v.id("risetDatasets")),
    name: v.string(),
    source: v.string(),
    format: FORMAT,
    rows: v.number(),
    sizeMB: v.number(),
    license: v.string(),
    lastUpdated: v.number(),
    description: v.string(),
    url: v.string(),
  },
  handler: async (ctx, { id, ...data }) => {
    if (id) {
      await ctx.db.patch(id, data);
      return id;
    }
    return ctx.db.insert("risetDatasets", data);
  },
});

export const remove = mutation({
  args: { id: v.id("risetDatasets") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});
