import { internalMutation, mutation } from "../../_generated/server";
import { v } from "convex/values";
import { requireAdmin } from "../../_shared/auth";

const SUBSCRIBE_WINDOW_MS = 60 * 60 * 1000;
const SUBSCRIBE_MAX_PER_WINDOW = 3;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function generateUnsubToken(): string {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
}

// Public subscribe endpoint — honeypot + rate-limit + idempotent on email.
// Returns ok with a status string the caller can branch on. Wrap in a
// consumer-side action if you need analytics emission or transactional
// welcome email.
export const subscribe = mutation({
  args: {
    email: v.string(),
    source: v.optional(v.string()),
    // Honeypot — bots fill, humans skip.
    website: v.optional(v.string()),
  },
  returns: v.object({
    ok: v.boolean(),
    status: v.union(
      v.literal("created"),
      v.literal("already"),
      v.literal("resubscribed"),
      v.literal("honeypot"),
    ),
  }),
  handler: async (ctx, { email, source, website }) => {
    if (website && website.trim().length > 0) {
      return { ok: true, status: "honeypot" as const };
    }
    const normalized = email.toLowerCase().trim();
    if (!EMAIL_RE.test(normalized)) {
      throw new Error("Email tidak valid");
    }

    const since = Date.now() - SUBSCRIBE_WINDOW_MS;
    const recent = await ctx.db
      .query("subscriberAttempts")
      .withIndex("by_email_time", (q) =>
        q.eq("email", normalized).gt("attemptedAt", since),
      )
      .take(SUBSCRIBE_MAX_PER_WINDOW + 1);
    if (recent.length >= SUBSCRIBE_MAX_PER_WINDOW) {
      throw new Error("Sudah terlalu banyak. Coba lagi nanti.");
    }
    await ctx.db.insert("subscriberAttempts", {
      email: normalized,
      attemptedAt: Date.now(),
    });

    const existing = await ctx.db
      .query("subscribers")
      .withIndex("by_email", (q) => q.eq("email", normalized))
      .first();
    if (existing) {
      if (existing.unsubscribedAt) {
        await ctx.db.patch(existing._id, { unsubscribedAt: undefined });
        return { ok: true, status: "resubscribed" as const };
      }
      return { ok: true, status: "already" as const };
    }

    await ctx.db.insert("subscribers", {
      email: normalized,
      source: source?.slice(0, 80),
      confirmed: true,
      unsubscribeToken: generateUnsubToken(),
      createdAt: Date.now(),
      confirmedAt: Date.now(),
    });
    return { ok: true, status: "created" as const };
  },
});

// Token-based unsubscribe — link in newsletter email contains
// `?t=<unsubscribeToken>`. Idempotent: re-clicks are no-ops.
export const unsubscribe = mutation({
  args: { token: v.string() },
  returns: v.object({ ok: v.boolean() }),
  handler: async (ctx, { token }) => {
    const row = await ctx.db
      .query("subscribers")
      .withIndex("by_token", (q) => q.eq("unsubscribeToken", token))
      .first();
    if (!row) return { ok: false };
    await ctx.db.patch(row._id, { unsubscribedAt: Date.now() });
    return { ok: true };
  },
});

// Admin hard-delete. Use sparingly — unsubscribe path preserves audit.
export const remove = mutation({
  args: { id: v.id("subscribers") },
  returns: v.object({ success: v.boolean() }),
  handler: async (ctx, { id }) => {
    await requireAdmin(ctx);
    await ctx.db.delete(id);
    return { success: true };
  },
});

// Cron-driven cleanup (convex/crons.ts, daily). Attempts only matter inside
// SUBSCRIBE_WINDOW_MS; older rows are dead weight that would otherwise
// accumulate forever.
export const _pruneAttempts = internalMutation({
  args: {},
  returns: v.object({ deleted: v.number() }),
  handler: async (ctx) => {
    const cutoff = Date.now() - 24 * 60 * 60 * 1000;
    const old = await ctx.db
      .query("subscriberAttempts")
      .withIndex("by_attemptedAt", (q) => q.lt("attemptedAt", cutoff))
      .take(1000);
    for (const row of old) await ctx.db.delete(row._id);
    return { deleted: old.length };
  },
});
