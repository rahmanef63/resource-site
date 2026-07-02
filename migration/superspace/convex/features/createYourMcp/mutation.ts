import { mutation } from "../../_generated/server";
import { v } from "convex/values";
// rr shipped `requireAdmin` from `@/shared/auth` (`convex/_shared/auth`), which
// does not exist in superspace. Map to the canonical RBAC gate in
// `convex/features/lib/rbac.ts`. Superspace's `requireAdmin` returns an
// ActorContext (admin doc), NOT an `Id<"users">`, so pair it with `ensureUser`
// from the auth helpers to obtain the `v.id("users")` the schema expects.
import { requireAdmin } from "../lib/rbac";
import { ensureUser } from "../../auth/helpers";
import { randomHex, verifyPkce, isAllowedRedirect } from "./_pkce";

const CODE_TTL_MS = 5 * 60 * 1000; // 5 min
const TOKEN_TTL_MS = 365 * 24 * 60 * 60 * 1000; // 1 year

// Mint an authorization code after the admin has consented at
// /oauth/authorize. The page calls this with the OAuth params from
// the AI client plus the admin's session-authenticated context.
// @dod:skip-audit reason="OAuth 2.1 authorization-code issuance (MCP scaffold, non-functional); admin is session-authenticated at /oauth/authorize. Audit wiring deferred until the MCP server is made live."
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
    await requireAdmin(ctx); // admin-only consent gate
    const userId = await ensureUser(ctx); // Id<"users"> for the oauthCodes row
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
// @dod:skip-permissions reason="OAuth 2.1 token endpoint — authenticated by the authorization code + PKCE verifier per protocol, NOT workspace RBAC (caller is a pre-auth MCP client). MCP scaffold, non-functional."
// @dod:skip-audit reason="OAuth token exchange (MCP scaffold, non-functional); audit deferred until the MCP server is made live."
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

// @dod:skip-audit reason="OAuth token revocation (MCP scaffold, non-functional); audit deferred until the MCP server is made live."
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
// the token VALUE (not a row id), we resolve it via by_token and patch
// only on a hit. Taking an id here would let any anonymous caller
// enumerate token ids and tamper with lastUsedAt — this stays a public
// mutation (ConvexHttpClient can't reach internal functions), so the
// arg has to carry the proof.
// @dod:skip-permissions reason="Internal last-used timestamp bump keyed by opaque bearer token (OAuth resource-server path), not workspace RBAC. MCP scaffold, non-functional."
// @dod:skip-audit reason="Token last-used bump (high-frequency, non-security-relevant); MCP scaffold, non-functional."
export const touchToken = mutation({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    // Mirror findToken's junk guard — real tokens are ≥32 chars.
    if (!token || token.length < 32) return { success: false };
    const row = await ctx.db
      .query("oauthAccessTokens")
      .withIndex("by_token", (q) => q.eq("token", token))
      .first();
    // No-op on miss (revoked/expired race, or env-fallback auth path) —
    // never throw; the caller already discards failures.
    if (!row) return { success: false };
    await ctx.db.patch(row._id, { lastUsedAt: Date.now() });
    return { success: true };
  },
});
