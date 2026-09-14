import { internalMutation, mutation } from "../../_generated/server";
import { v } from "convex/values";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_EMAIL_LEN = 200;
const SUBSCRIBE_WINDOW_MS = 60 * 60 * 1000;
const SUBSCRIBE_MAX_PER_WINDOW = 3;

function normalizeEmail(value: string): string {
  const email = value.trim().toLowerCase();
  if (!email || email.length > MAX_EMAIL_LEN || !EMAIL_RE.test(email)) {
    throw new Error("Email tidak valid");
  }
  return email;
}

export const subscribe = mutation({
  args: { email: v.string(), website: v.optional(v.string()) },
  returns: v.object({ ok: v.boolean(), already: v.boolean() }),
  handler: async (ctx, { email, website }) => {
    if (website?.trim()) return { ok: true, already: false };
    const normalized = normalizeEmail(email);
    const now = Date.now();
    const since = now - SUBSCRIBE_WINDOW_MS;
    const recent = await ctx.db
      .query("newsletterSubscribeAttempts")
      .withIndex("by_email_time", (q) => q.eq("email", normalized).gt("attemptedAt", since))
      .take(SUBSCRIBE_MAX_PER_WINDOW + 1);
    if (recent.length >= SUBSCRIBE_MAX_PER_WINDOW) {
      throw new Error("Sudah terlalu banyak. Coba lagi nanti.");
    }
    await ctx.db.insert("newsletterSubscribeAttempts", { email: normalized, attemptedAt: now });

    const existing = await ctx.db
      .query("newsletterSubscribers")
      .withIndex("by_email", (q) => q.eq("email", normalized))
      .unique();
    if (existing?.status === "active") return { ok: true, already: true };
    if (existing) {
      await ctx.db.patch(existing._id, {
        status: "active",
        subscribedAt: now,
        confirmedAt: now,
        unsubscribedAt: undefined,
      });
      return { ok: true, already: false };
    }
    await ctx.db.insert("newsletterSubscribers", {
      email: normalized,
      status: "active",
      subscribedAt: now,
      confirmedAt: now,
    });
    return { ok: true, already: false };
  },
});

export const unsubscribe = mutation({
  args: { email: v.string() },
  returns: v.object({ ok: v.boolean(), already: v.boolean() }),
  handler: async (ctx, { email }) => {
    const normalized = normalizeEmail(email);
    const existing = await ctx.db
      .query("newsletterSubscribers")
      .withIndex("by_email", (q) => q.eq("email", normalized))
      .unique();
    if (!existing || existing.status === "unsubscribed") {
      return { ok: true, already: true };
    }
    await ctx.db.patch(existing._id, {
      status: "unsubscribed",
      unsubscribedAt: Date.now(),
    });
    return { ok: true, already: false };
  },
});

export const createIssue = internalMutation({
  args: { subject: v.string(), body: v.string() },
  returns: v.id("newsletterIssues"),
  handler: async (ctx, { subject, body }) => ctx.db.insert("newsletterIssues", {
    subject,
    body,
    status: "draft",
    createdAt: Date.now(),
  }),
});

export const markSending = internalMutation({
  args: { issueId: v.id("newsletterIssues") },
  handler: async (ctx, { issueId }) => {
    await ctx.db.patch(issueId, { status: "sending" });
  },
});

export const markSent = internalMutation({
  args: { issueId: v.id("newsletterIssues"), sentCount: v.number() },
  handler: async (ctx, { issueId, sentCount }) => {
    await ctx.db.patch(issueId, { status: "sent", sentAt: Date.now(), sentCount });
  },
});

export const _pruneAttempts = internalMutation({
  args: {},
  returns: v.object({ deleted: v.number() }),
  handler: async (ctx) => {
    const cutoff = Date.now() - 24 * 60 * 60 * 1000;
    const old = await ctx.db
      .query("newsletterSubscribeAttempts")
      .withIndex("by_attemptedAt", (q) => q.lt("attemptedAt", cutoff))
      .take(1000);
    for (const row of old) await ctx.db.delete(row._id);
    return { deleted: old.length };
  },
});
