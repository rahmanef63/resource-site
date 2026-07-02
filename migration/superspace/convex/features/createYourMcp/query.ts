import { query } from "../../_generated/server";
import { v } from "convex/values";
// rr's `@/shared/auth` (`convex/_shared/auth`) does not exist in superspace;
// map to the canonical RBAC gate. `adminList` uses it purely as a gate, so the
// ActorContext return (vs rr's userId) is discarded here.
import { requireAdmin } from "../lib/rbac";

// Admin view of every issued access token. requireAdmin gates this at
// the query layer — Convex HTTP queries are directly reachable, so a
// Next.js layout-only gate is not enough. Raw `token` field stripped
// from the wire so it never leaves Convex; admin sees a preview only.
export const adminList = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit }) => {
    await requireAdmin(ctx);
    const rows = await ctx.db
      .query("oauthAccessTokens")
      .withIndex("by_user_time")
      .order("desc")
      .take(limit ?? 200);
    return rows.map((r) => ({
      _id: r._id,
      tokenPreview: `${r.token.slice(0, 8)}…${r.token.slice(-4)}`,
      userId: r.userId,
      clientId: r.clientId,
      scope: r.scope ?? null,
      resource: r.resource ?? null,
      expiresAt: r.expiresAt,
      createdAt: r.createdAt,
      lastUsedAt: r.lastUsedAt ?? null,
      revokedAt: r.revokedAt ?? null,
      label: r.label ?? null,
    }));
  },
});

// Public — called from /api/mcp route. Returns null on any invalid /
// expired / revoked state so the route can fall back to the static
// MCP_API_KEY env check.
export const findToken = query({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    if (!token || token.length < 32) return null;
    const row = await ctx.db
      .query("oauthAccessTokens")
      .withIndex("by_token", (q) => q.eq("token", token))
      .first();
    if (!row) return null;
    if (row.revokedAt) return null;
    if (row.expiresAt < Date.now()) return null;
    return {
      _id: row._id,
      userId: row.userId,
      scope: row.scope ?? null,
      clientId: row.clientId,
    };
  },
});
