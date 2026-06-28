// OAuth HTTP route handlers — /.well-known/* + /oauth/authorize + /api/oauth/token.
// Returns `true` if the request was handled, `false` to fall through.

import {
  b64url, mintAccessToken, verifyPkce, authCodes, AUTH_CODE_TTL_MS, randomBytes,
} from "./oauth.mjs";
import { renderConsentPage } from "./oauth-consent-page.mjs";

export function handleOAuthMetadata(req, res, { reqOrigin }) {
  if (req.url?.startsWith("/.well-known/oauth-authorization-server")) {
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Cache-Control", "public, max-age=3600");
    res.end(JSON.stringify({
      issuer: reqOrigin,
      authorization_endpoint: `${reqOrigin}/oauth/authorize`,
      token_endpoint: `${reqOrigin}/api/oauth/token`,
      response_types_supported: ["code"],
      grant_types_supported: ["authorization_code"],
      code_challenge_methods_supported: ["S256"],
      token_endpoint_auth_methods_supported: ["none"],
      scopes_supported: ["mcp"],
    }));
    return true;
  }
  if (req.url?.startsWith("/.well-known/oauth-protected-resource")) {
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Cache-Control", "public, max-age=3600");
    res.end(JSON.stringify({
      resource: `${reqOrigin}/mcp`,
      authorization_servers: [reqOrigin],
      scopes_supported: ["mcp"],
      bearer_methods_supported: ["header"],
    }));
    return true;
  }
  return false;
}

export function handleOAuthAuthorize(req, res, { reqOrigin }) {
  if (!req.url?.startsWith("/oauth/authorize") || (req.method !== "GET" && req.method !== "POST")) {
    return false;
  }
  const url = new URL(req.url, reqOrigin || "http://localhost");
  const params = url.searchParams;
  const clientId = params.get("client_id");
  const redirectUri = params.get("redirect_uri");
  const responseType = params.get("response_type");
  const codeChallenge = params.get("code_challenge");
  const codeChallengeMethod = params.get("code_challenge_method") || "S256";
  const state = params.get("state") || "";
  const scope = params.get("scope") || "mcp";
  const resource = params.get("resource") || `${reqOrigin}/mcp`;

  const errs = [];
  if (responseType !== "code") errs.push("response_type must be 'code'");
  if (!clientId) errs.push("client_id required");
  if (!redirectUri) errs.push("redirect_uri required");
  try {
    // Reject control chars (CR/LF/tab) BEFORE new URL() — WHATWG URL silently
    // strips them, so a redirect_uri like ".../%0D%0AInjected" would parse as
    // valid here yet keep its \r\n in the raw string and blow up res.setHeader
    // ("Location", …) with ERR_INVALID_CHAR on the POST branch (unauth DoS).
    if (/[\x00-\x1f\x7f]/.test(redirectUri)) throw new Error("control char in redirect_uri");
    const u = new URL(redirectUri);
    if (u.protocol !== "https:" && u.hostname !== "localhost" && u.hostname !== "127.0.0.1") {
      errs.push("redirect_uri must be HTTPS (or localhost)");
    }
  } catch { errs.push("redirect_uri invalid URL"); }
  if (!codeChallenge) errs.push("code_challenge required");
  if (codeChallengeMethod !== "S256") errs.push("code_challenge_method must be S256");
  if (errs.length > 0) {
    res.statusCode = 400;
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    const esc = (e) => e.replace(/[<>&]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" }[c]));
    res.end(`<!doctype html><meta charset=utf-8><title>OAuth error</title><pre>${errs.map(esc).join("\n")}</pre>`);
    return true;
  }

  if (req.method === "POST") {
    const code = b64url(randomBytes(24));
    authCodes.set(code, {
      challenge: codeChallenge,
      method: codeChallengeMethod,
      redirectUri,
      clientId,
      scope,
      resource,
      exp: Date.now() + AUTH_CODE_TTL_MS,
    });
    const sep = redirectUri.includes("?") ? "&" : "?";
    const loc = `${redirectUri}${sep}code=${encodeURIComponent(code)}${state ? `&state=${encodeURIComponent(state)}` : ""}`;
    res.statusCode = 302;
    res.setHeader("Location", loc);
    res.end();
    return true;
  }

  // GET — render consent page.
  res.statusCode = 200;
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.end(renderConsentPage({ clientId, redirectUri, state, scope, resource, params }));
  return true;
}

export async function handleOAuthToken(req, res, { oauthKey }) {
  if (req.url !== "/api/oauth/token" || req.method !== "POST") return false;
  const ctype = String(req.headers["content-type"] || "");
  let raw = "";
  let bytes = 0;
  let killed = false;
  try {
    await new Promise((resolve, reject) => {
      req.on("data", (chunk) => {
        if (killed) return;
        bytes += chunk.length;
        if (bytes > 64 * 1024) { killed = true; req.destroy(); reject(Object.assign(new Error("body too large"), { statusCode: 413 })); return; }
        raw += chunk;
      });
      req.on("end", () => { if (!killed) resolve(); });
      req.on("error", reject);
    });
  } catch (err) {
    res.statusCode = err?.statusCode ?? 500;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: "invalid_request" }));
    return true;
  }
  let parsed = {};
  try {
    if (ctype.includes("application/json")) parsed = JSON.parse(raw || "{}");
    else for (const [k, v] of new URLSearchParams(raw)) parsed[k] = v;
  } catch {
    res.statusCode = 400;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: "invalid_request", error_description: "malformed body" }));
    return true;
  }
  const { grant_type, code, code_verifier, redirect_uri, client_id } = parsed || {};
  const failJson = (status, err, desc) => {
    res.statusCode = status;
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Cache-Control", "no-store");
    res.end(JSON.stringify({ error: err, ...(desc ? { error_description: desc } : {}) }));
  };
  if (grant_type !== "authorization_code") { failJson(400, "unsupported_grant_type", "expected authorization_code"); return true; }
  if (!code || !code_verifier || !redirect_uri || !client_id) { failJson(400, "invalid_request", "missing field"); return true; }
  const rec = authCodes.get(code);
  if (!rec) { failJson(400, "invalid_grant", "code unknown"); return true; }
  // Atomic single-use.
  authCodes.delete(code);
  if (rec.exp <= Date.now()) { failJson(400, "invalid_grant", "code expired"); return true; }
  if (rec.clientId !== client_id) { failJson(400, "invalid_grant", "client_id mismatch"); return true; }
  if (rec.redirectUri !== redirect_uri) { failJson(400, "invalid_grant", "redirect_uri mismatch"); return true; }
  if (!verifyPkce({ verifier: code_verifier, challenge: rec.challenge, method: rec.method })) {
    failJson(400, "invalid_grant", "PKCE verifier mismatch");
    return true;
  }
  const access_token = mintAccessToken(oauthKey);
  res.statusCode = 200;
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify({
    access_token,
    token_type: "Bearer",
    expires_in: 365 * 24 * 60 * 60,
    scope: rec.scope,
  }));
  return true;
}
