// OAuth 2.1 + PKCE for the ceremonial ChatGPT custom-app connector form.
//
// Design choices:
//   - data is PUBLIC read-only (kitab manifest), so consent page is NOT
//     gated by admin login. Anyone who visits /oauth/authorize can mint
//     a token by clicking Authorize.
//   - access tokens are stateless HMAC-signed strings (no DB).
//   - auth codes live in an in-memory Map with TTL (5 min). Container
//     restart drops mid-flow codes — user re-clicks Authorize.
//   - revocation = rotate SIGNING_KEY.

import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";

export function b64url(buf) {
  return Buffer.from(buf).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
export function sha256B64Url(s) {
  return b64url(createHash("sha256").update(s).digest());
}

// HMAC-bound opaque access token. JWT-shaped without the JOSE header
// overhead — we control both sides, no interop concern.
export function mintAccessToken(signingKey, ttlSeconds = 365 * 24 * 60 * 60) {
  const random = b64url(randomBytes(32));
  const exp = Math.floor(Date.now() / 1000) + ttlSeconds;
  const payload = `${random}.${exp}`;
  const sig = b64url(createHmac("sha256", signingKey).update(payload).digest());
  return `${payload}.${sig}`;
}
export function verifyAccessToken(token, signingKey) {
  if (typeof token !== "string") return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [random, expStr, sig] = parts;
  if (!random || !expStr || !sig) return null;
  const exp = Number(expStr);
  if (!Number.isFinite(exp) || exp <= Math.floor(Date.now() / 1000)) return null;
  const payload = `${random}.${expStr}`;
  const expected = b64url(createHmac("sha256", signingKey).update(payload).digest());
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return null;
  if (!timingSafeEqual(a, b)) return null;
  return { exp, jti: random };
}

// Auth code store. Map<code, { challenge, method, redirectUri, clientId, scope, resource, exp }>.
export const authCodes = new Map();
export const AUTH_CODE_TTL_MS = 5 * 60 * 1000;
setInterval(() => {
  const now = Date.now();
  for (const [code, rec] of authCodes) if (rec.exp <= now) authCodes.delete(code);
}, 60_000).unref?.();

export function verifyPkce({ verifier, challenge, method }) {
  if (method !== "S256") return false; // refuse 'plain' per spec
  if (typeof verifier !== "string" || verifier.length < 43 || verifier.length > 128) return false;
  return sha256B64Url(verifier) === challenge;
}

export { randomBytes };
