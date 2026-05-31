// PKCE S256 helpers (RFC 7636).
// Convex isolate has SubtleCrypto via the global `crypto`; no node:crypto.

const toBase64Url = (buf: ArrayBuffer): string => {
  const bytes = new Uint8Array(buf);
  let s = "";
  for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
};

export const sha256Base64Url = async (input: string): Promise<string> => {
  const buf = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(input),
  );
  return toBase64Url(buf);
};

export const randomHex = (byteLen: number): string => {
  const bytes = new Uint8Array(byteLen);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
};

// Verify codeVerifier against stored codeChallenge using the named method.
// We deliberately accept only "S256" — every modern AI client
// (ChatGPT, Claude.ai, Cursor) advertises it; "plain" is a downgrade.
export const verifyPkce = async (
  codeVerifier: string,
  codeChallenge: string,
  method: string,
): Promise<boolean> => {
  if (method !== "S256") return false;
  if (!codeVerifier || codeVerifier.length < 43 || codeVerifier.length > 128) {
    return false;
  }
  const derived = await sha256Base64Url(codeVerifier);
  if (derived.length !== codeChallenge.length) return false;
  // Constant-time compare.
  let acc = 0;
  for (let i = 0; i < derived.length; i++) {
    acc |= derived.charCodeAt(i) ^ codeChallenge.charCodeAt(i);
  }
  return acc === 0;
};

// Redirect-URI allowlist. Consumer configures via env vars:
//
//   MCP_OAUTH_ALLOWED_HOSTS=chatgpt.com,claude.ai,cursor.sh
//   MCP_OAUTH_ALLOWED_PATH_PREFIXES=/aip/,/connector/,/oauth/
//
// Empty env = no remote redirects allowed (localhost only).
// Generic implementation — DOES NOT bake in vendor literals so the slice
// stays portable. Update env when a new AI client lands a connector.
export const isAllowedRedirect = (raw: string): boolean => {
  let parsed: URL;
  try {
    parsed = new URL(raw);
  } catch {
    return false;
  }
  // Block userinfo (user:pass@host) — homograph + parser-confusion vector.
  if (parsed.username || parsed.password) return false;
  // Block fragments — RFC 6749 §3.1.2 forbids them in redirect_uri.
  if (parsed.hash) return false;
  // Dev convenience — localhost always allowed (prod doesn't bind it).
  if (parsed.protocol === "http:" && parsed.hostname === "localhost") {
    return true;
  }
  if (parsed.protocol !== "https:") return false;

  const allowedHostsCsv = process.env.MCP_OAUTH_ALLOWED_HOSTS ?? "";
  const allowedHosts = allowedHostsCsv
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (allowedHosts.length === 0) return false;
  const hostOk = allowedHosts.some(
    (host) =>
      parsed.hostname === host || parsed.hostname.endsWith("." + host),
  );
  if (!hostOk) return false;

  const allowedPathsCsv = process.env.MCP_OAUTH_ALLOWED_PATH_PREFIXES ?? "";
  const allowedPaths = allowedPathsCsv
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  // Empty path allowlist = any path under an allowed host accepted.
  // Tighten by setting MCP_OAUTH_ALLOWED_PATH_PREFIXES for defense-in-depth.
  if (allowedPaths.length === 0) return true;
  const path = parsed.pathname || "/";
  return allowedPaths.some((p) => path === p || path.startsWith(p));
};
