import { mutation, query } from "../../_generated/server";
import { v } from "convex/values";
import { requireAdmin } from "../../_shared/auth";

const STATUS = v.union(
  v.literal("new"),
  v.literal("open"),
  v.literal("won"),
  v.literal("lost"),
);

export const list = query({
  args: { status: v.optional(STATUS) },
  handler: async (ctx, { status }) => {
    await requireAdmin(ctx);
    if (status) {
      return ctx.db
        .query("ac_leads")
        .withIndex("by_status", (q) => q.eq("status", status))
        .take(500);
    }
    return ctx.db.query("ac_leads").withIndex("by_createdAt").order("desc").take(500);
  },
});

export const get = query({
  args: { id: v.id("ac_leads") },
  handler: async (ctx, { id }) => {
    await requireAdmin(ctx);
    return ctx.db.get(id);
  },
});

/**
 * Public write — this is the contact-form ingestion point.
 * ponytail: no auth by design; gate abuse with the `rate-limit` slice at the
 * HTTP/action caller. Length guards here bound the obvious payload attack.
 */
export const create = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    message: v.string(),
    source: v.optional(v.string()),
  },
  handler: async (ctx, a) => {
    if (a.name.length > 200 || a.email.length > 200 || a.message.length > 5000) {
      throw new Error("Input too long");
    }
    return ctx.db.insert("ac_leads", {
      name: a.name,
      email: a.email,
      message: a.message,
      source: a.source ?? "contact-form",
      status: "new",
      notes: [],
      createdAt: Date.now(),
    });
  },
});

export const updateStatus = mutation({
  args: { id: v.id("ac_leads"), status: STATUS, assignee: v.optional(v.string()) },
  handler: async (ctx, { id, status, assignee }) => {
    await requireAdmin(ctx);
    await ctx.db.patch(id, { status, ...(assignee !== undefined ? { assignee } : {}) });
    return { success: true };
  },
});

export const addNote = mutation({
  args: { id: v.id("ac_leads"), note: v.string() },
  handler: async (ctx, { id, note }) => {
    await requireAdmin(ctx);
    const lead = await ctx.db.get(id);
    if (!lead) throw new Error("Lead not found");
    await ctx.db.patch(id, { notes: [...lead.notes, note] });
    return { success: true };
  },
});
