import { mutation } from "../../_generated/server";
import { v } from "convex/values";
import { requireAdmin } from "../../_shared/auth";
import { randomHex, verifyPkce, isAllowedRedirect, sha256Base64Url } from "./_pkce";

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
    // store the digest — the raw code travels back to the client in the
    // redirect and is never persisted.
    await ctx.db.insert("oauthCodes", {
      codeHash: await sha256Base64Url(code),
      codeChallenge: args.codeChallenge,
      codeChallengeMethod: args.codeChallengeMethod,
      redirectUri: args.redirectUri,
      clientId: args.clientId,
      scope: args.scope,
      resource: args.resource,
      userId,
      expiresAt: Date.now() + CODE_TTL_MS,
      createdAt: Date.now(),
    });
    return { code };
  },
});

// Exchange a code + PKCE verifier for an access token. Single-use —
// the code row is deleted atomically BEFORE token issuance so a retry
// can't double-issue.
//
// All failure modes collapse to the same opaque message so a
// captured-but-failed exchange can't be used to distinguish "unknown" vs
// "already redeemed" vs "expired" vs "PKCE mismatch" — that distinction is
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
    const codeHash = await sha256Base64Url(args.code);
    const row = await ctx.db
      .query("oauthCodes")
      .withIndex("by_code_hash", (q) => q.eq("codeHash", codeHash))
      .first();
    if (!row) {
      console.warn("mcp.exchangeCode rejected: unknown code");
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

    // Delete, don't flag: a replayed code then hits the "unknown code"
    // branch above (same opaque error) and the table stays bounded.
    await ctx.db.delete(row._id);

    const token = randomHex(32);
    const now = Date.now();
    await ctx.db.insert("oauthAccessTokens", {
      tokenHash: await sha256Base64Url(token),
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

// Bump lastUsedAt on every successful MCP call. Called by the /api/mcp
// route after validating the bearer; fire-and-forget on the route side
// so a Convex hiccup doesn't fail the JSON-RPC reply.
//
// Authorization = possession of the bearer itself: the caller hands us
// the token DIGEST (not a row id), which only a holder of the raw token
// can compute, and we patch only on a hit. Taking an id here would let
// any anonymous caller enumerate token ids and tamper with lastUsedAt —
// this stays a public mutation (ConvexHttpClient can't reach internal
// functions), so the arg has to carry the proof.
export const touchToken = mutation({
  args: { tokenHash: v.string() },
  handler: async (ctx, { tokenHash }) => {
    // Mirror findToken's junk guard — a real sha256 digest is fixed-length.
    if (!tokenHash || tokenHash.length < 32) return { success: false };
    const row = await ctx.db
      .query("oauthAccessTokens")
      .withIndex("by_hash", (q) => q.eq("tokenHash", tokenHash))
      .first();
    // No-op on miss (revoked/expired race, or env-fallback auth path) —
    // never throw; the caller already discards failures.
    if (!row) return { success: false };
    await ctx.db.patch(row._id, { lastUsedAt: Date.now() });
    return { success: true };
  },
});
