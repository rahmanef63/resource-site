import { internalMutation, mutation } from "../../_generated/server";
import { v } from "convex/values";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_EMAIL_LEN = 200;
const SUBSCRIBE_WINDOW_MS = 60 * 60 * 1000;
const SUBSCRIBE_MAX_PER_WINDOW = 3;

// Public subscribe endpoint — honeypot + per-email windowed rate-limit +
// shape/length validation + idempotent on email. Mirrors the hardened
// `subscribers` slice; the newsletterSubscribers "unsubscribed" status
// covers what the unsubscribe-token does there.
export const subscribe = mutation({
  args: {
    email: v.string(),
    // Honeypot — bots fill, humans skip.
    website: v.optional(v.string()),
  },
  returns: v.object({ ok: v.boolean(), already: v.boolean() }),
  handler: async (ctx, { email, website }) => {
    if (website && website.trim().length > 0) {
      return { ok: true, already: false };
    }
    const normalized = email.trim().toLowerCase();
    if (normalized.length === 0 || normalized.length > MAX_EMAIL_LEN) {
      throw new Error("Email tidak valid");
    }
    if (!EMAIL_RE.test(normalized)) {
      throw new Error("Email tidak valid");
    }

    const since = Date.now() - SUBSCRIBE_WINDOW_MS;
    const recent = await ctx.db
      .query("newsletterSubscribeAttempts")
      .withIndex("by_email_time", (q) =>
        q.eq("email", normalized).gt("attemptedAt", since),
      )
      .take(SUBSCRIBE_MAX_PER_WINDOW + 1);
    if (recent.length >= SUBSCRIBE_MAX_PER_WINDOW) {
      throw new Error("Sudah terlalu banyak. Coba lagi nanti.");
    }
    await ctx.db.insert("newsletterSubscribeAttempts", {
      email: normalized,
      attemptedAt: Date.now(),
    });

    const existing = await ctx.db
      .query("newsletterSubscribers")
      .withIndex("by_email", (q) => q.eq("email", normalized))
      .unique();
    if (existing) {
      if (existing.status === "active") return { ok: true, already: true };
      // Re-subscribe path
      await ctx.db.patch(existing._id, { status: "active", subscribedAt: Date.now() });
      return { ok: true, already: false };
    }
    await ctx.db.insert("newsletterSubscribers", {
      email: normalized,
      status: "pending",
      subscribedAt: Date.now(),
    });
    return { ok: true, already: false };
  },
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
    await ctx.db.patch(issueId, {
      status: "sent",
      sentAt: Date.now(),
      sentCount,
    });
  },
});
