import { mutation } from "../../_generated/server";
import { v } from "convex/values";
import { requireAdmin } from "../../_shared/auth";
import { randomHex, verifyPkce, isAllowedRedirect } from "./pkce";

const CODE_TTL_MS = 5 * 60 * 1000; // 5 min
const TOKEN_TTL_MS = 365 * 24 * 60 * 60 * 1000; // 1 year

// Mint an authorization code after the admin has consented at
// /oauth/authorize. The page calls this with the OAuth params from
// the AI client plus the admin's session-authenticated context.
export const createCode = mutation({
  args: {
    codeChallenge: v.string(),
    codeChallengeMethod: v.string(),
    redirectUri: v.string(),
    clientId: v.string(),
    scope: v.optional(v.string()),
    resource: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await requireAdmin(ctx);
    if (args.codeChallengeMethod !== "S256") {
      throw new Error("Only S256 PKCE method is supported");
    }
    if (!args.codeChallenge || args.codeChallenge.length < 43) {
      throw new Error("Invalid code_challenge");
    }
    if (!isAllowedRedirect(args.redirectUri)) {
      throw new Error(
        "redirect_uri host/path not allowed. Configure via MCP_OAUTH_ALLOWED_HOSTS env (CSV of vendor domains).",
      );
    }
    const code = randomHex(32);
    await ctx.db.insert("oauthCodes", {
      code,
      codeChallenge: args.codeChallenge,
      codeChallengeMethod: args.codeChallengeMethod,
      redirectUri: args.redirectUri,
      clientId: args.clientId,
      scope: args.scope,
      resource: args.resource,
      userId,
      expiresAt: Date.now() + CODE_TTL_MS,
      consumed: false,
      createdAt: Date.now(),
    });
    return { code };
  },
});

// Exchange a code + PKCE verifier for an access token. Single-use —
// codes are marked consumed atomically BEFORE token issuance so a retry
// can't double-issue.
//
// All failure modes collapse to the same opaque message so a
// captured-but-failed exchange can't be used to distinguish "unknown" vs
// "consumed" vs "expired" vs "PKCE mismatch" — that distinction is
// useful only to attackers narrowing down which step failed. Detailed
// reason stays in Convex stderr (server-side debugging).
export const exchangeCode = mutation({
  args: {
    code: v.string(),
    codeVerifier: v.string(),
    redirectUri: v.string(),
    clientId: v.string(),
  },
  returns: v.object({
    access_token: v.string(),
    token_type: v.string(),
    expires_in: v.number(),
    scope: v.optional(v.string()),
  }),
  handler: async (ctx, args) => {
    const GENERIC = "invalid_grant: code invalid";
    const row = await ctx.db
      .query("oauthCodes")
      .withIndex("by_code", (q) => q.eq("code", args.code))
      .first();
    if (!row) {
      console.warn("mcp.exchangeCode rejected: unknown code");
      throw new Error(GENERIC);
    }
    if (row.consumed) {
      console.warn("mcp.exchangeCode rejected: code already used", row._id);
      throw new Error(GENERIC);
    }
    if (row.expiresAt < Date.now()) {
      console.warn("mcp.exchangeCode rejected: code expired", row._id);
      throw new Error(GENERIC);
    }
    if (row.redirectUri !== args.redirectUri) {
      console.warn("mcp.exchangeCode rejected: redirect_uri mismatch", row._id);
      throw new Error(GENERIC);
    }
    if (row.clientId !== args.clientId) {
      console.warn("mcp.exchangeCode rejected: client_id mismatch", row._id);
      throw new Error(GENERIC);
    }
    const ok = await verifyPkce(
      args.codeVerifier,
      row.codeChallenge,
      row.codeChallengeMethod,
    );
    if (!ok) {
      console.warn("mcp.exchangeCode rejected: PKCE mismatch", row._id);
      throw new Error(GENERIC);
    }

    await ctx.db.patch(row._id, { consumed: true });

    const token = randomHex(32);
    const now = Date.now();
    await ctx.db.insert("oauthAccessTokens", {
      token,
      userId: row.userId,
      clientId: row.clientId,
      scope: row.scope,
      resource: row.resource,
      expiresAt: now + TOKEN_TTL_MS,
      createdAt: now,
      label: row.clientId,
    });

    return {
      access_token: token,
      token_type: "Bearer",
      expires_in: Math.floor(TOKEN_TTL_MS / 1000),
      scope: row.scope ?? undefined,
    };
  },
});

export const revokeToken = mutation({
  args: { id: v.id("oauthAccessTokens") },
  handler: async (ctx, { id }) => {
    await requireAdmin(ctx);
    await ctx.db.patch(id, { revokedAt: Date.now() });
    return { success: true };
  },
});

// Internal — bump lastUsedAt on every successful MCP call. Called by
// the /api/mcp route after validating the bearer. Fire-and-forget on
// the route side so a Convex hiccup doesn't fail the JSON-RPC reply.
export const touchToken = mutation({
  args: { id: v.id("oauthAccessTokens") },
  handler: async (ctx, { id }) => {
    await ctx.db.patch(id, { lastUsedAt: Date.now() });
    return { success: true };
  },
});
