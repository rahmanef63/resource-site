// Bearer-token check for the MCP endpoint. Two paths:
//
// 1. OAuth-issued token — validated via slices/create-your-mcp:findToken
//    Convex query. Each successful call returns the row id so the route
//    can bump lastUsedAt.
//
// 2. Static MCP_API_KEY env var — kept as a developer/CI escape hatch
//    (curl smoke tests, server scripts, service accounts). Disabled if
//    the env var is missing or under 32 chars.
//
// The two paths are CO-EQUAL — both flow through `requireAdmin` on
// every downstream Convex mutation. The env path is the documented
// service-account integration pattern for backend automation.

type FindTokenResult = { _id: string; scope: string | null } | null;

export type AuthResult =
  | { ok: false }
  | { ok: true; kind: "env"; scope: null }
  | {
      ok: true;
      kind: "oauth";
      tokenId: string;
      convexToken: string;
      scope: string | null;
    };

export const extractBearer = (headers: Headers): string | null => {
  const raw = headers.get("authorization") ?? headers.get("Authorization");
  if (!raw) return null;
  const [scheme, value] = raw.split(/\s+/, 2);
  if (!scheme || !value) return null;
  if (scheme.toLowerCase() !== "bearer") return null;
  return value.trim();
};

// Constant-time string compare. Faster-fail bail on length mismatch is
// safe because the token surface (random 32-byte hex) is fixed-length
// per-issuer — length leakage = "this is/isn't a 64-char hex token",
// which the surface already telegraphs by being a public bearer scheme.
export const tokenMatches = (provided: string, expected: string): boolean => {
  if (!provided || !expected) return false;
  if (provided.length !== expected.length) return false;
  let acc = 0;
  for (let i = 0; i < provided.length; i++) {
    acc |= provided.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  return acc === 0;
};

// Caller injects a `findToken` function (the route wires the consumer's
// Convex client) so the slice stays decoupled from any specific HTTP
// client setup. Returns null on any invalid/expired/revoked path.
export const checkAuth = async (
  headers: Headers,
  findToken: (token: string) => Promise<FindTokenResult>,
): Promise<AuthResult> => {
  const provided = extractBearer(headers);
  if (!provided) return { ok: false };

  // Try OAuth-issued token first — primary path for AI clients.
  try {
    const row = await findToken(provided);
    if (row) {
      return {
        ok: true,
        kind: "oauth",
        tokenId: row._id,
        convexToken: provided,
        scope: row.scope,
      };
    }
  } catch {
    // Convex unreachable — fall through to env check so service-account
    // scripts still work during a backend hiccup.
  }

  // Fallback: shared secret from env. Implicit full-scope.
  const expected = process.env.MCP_API_KEY;
  if (expected && expected.length >= 32 && tokenMatches(provided, expected)) {
    return { ok: true, kind: "env", scope: null };
  }

  return { ok: false };
};

// Scope is a space-separated list (RFC 6749 §3.3). `null` = no scope
// claim → treated as full access for env-bypass and legacy tokens.
export const scopeAllows = (
  tokenScope: string | null,
  requiredScope: string | undefined,
): boolean => {
  if (!requiredScope) return true;
  if (tokenScope === null) return true;
  return tokenScope.split(/\s+/).includes(requiredScope);
};
