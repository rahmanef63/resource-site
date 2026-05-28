import { internalMutation, mutation } from "../../_generated/server";
import { v } from "convex/values";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_EMAIL_LEN = 200;

// Public subscribe endpoint — validates + normalises + idempotent on
// email. NOTE: this slice has no per-IP rate-limit table; bot abuse is
// only defended by the email-shape check + per-email idempotency. For
// production traffic prefer the `subscribers` slice (honeypot + windowed
// per-email rate-limit + unsubscribe-token).
export const subscribe = mutation({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    const normalized = email.trim().toLowerCase();
    if (normalized.length === 0 || normalized.length > MAX_EMAIL_LEN) {
      throw new Error("Email tidak valid");
    }
    if (!EMAIL_RE.test(normalized)) {
      throw new Error("Email tidak valid");
    }
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
