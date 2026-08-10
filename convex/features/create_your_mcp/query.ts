import { query } from "../../_generated/server";
import { v } from "convex/values";
import { requireAdmin } from "../../_shared/auth";
import { sha256Base64Url } from "./_pkce";

// Admin view of every issued access token. requireAdmin gates this at
// the query layer — Convex HTTP queries are directly reachable, so a
// Next.js layout-only gate is not enough. There is no token preview to
// return: only the digest is stored, so there is nothing to redact.
// Tokens are identified in the UI by `label` + `createdAt`.
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

// Public — called from /api/mcp route with sha256(bearer), never the
// bearer itself, so the raw credential never appears in a Convex
// function argument. Returns null on any invalid / expired / revoked
// state so the route can fall back to the static MCP_API_KEY env check.
export const findToken = query({
  args: { tokenHash: v.string() },
  handler: async (ctx, { tokenHash }) => {
    if (!tokenHash || tokenHash.length < 32) return null;
    const row = await ctx.db
      .query("oauthAccessTokens")
      .withIndex("by_hash", (q) => q.eq("tokenHash", tokenHash))
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
