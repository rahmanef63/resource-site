// OAuth consent page renderer — minimal HTML with hidden form echoing
// all PKCE params so POST re-receives them (auth code MAC binds to challenge).

const esc = (s) => String(s ?? "").replace(/[<>&"']/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;", "'": "&#39;" }[c]));

export function renderConsentPage({ clientId, redirectUri, state, scope, resource, params }) {
  const hidden = Object.fromEntries(params.entries());
  const inputs = Object.entries(hidden).map(([k, v]) => `<input type="hidden" name="${esc(k)}" value="${esc(v)}">`).join("");
  const denyHref = `${redirectUri}${redirectUri.includes("?") ? "&" : "?"}error=access_denied${state ? `&state=${esc(state)}` : ""}`;
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Authorize ${esc(clientId)} — rahman-resources-mcp</title>
<style>
  *{box-sizing:border-box}body{font:14px/1.5 system-ui,sans-serif;margin:0;background:#0a0a0a;color:#fafafa;display:grid;place-items:center;min-height:100vh;padding:24px}
  .card{max-width:480px;width:100%;background:#171717;border:1px solid #262626;border-radius:12px;padding:32px}
  h1{margin:0 0 8px;font-size:18px}h2{margin:0 0 4px;font-size:13px;color:#a3a3a3;font-weight:500;text-transform:uppercase;letter-spacing:0.04em}
  p{margin:8px 0;color:#d4d4d4}.client{font-family:ui-monospace,monospace;background:#262626;padding:2px 6px;border-radius:4px;font-size:12px}
  ul{margin:8px 0;padding-left:20px;color:#d4d4d4;font-size:13px}
  .actions{margin-top:24px;display:flex;gap:12px}
  button{flex:1;padding:10px 16px;border-radius:6px;border:1px solid #404040;background:#262626;color:#fafafa;font:inherit;cursor:pointer}
  button[type=submit]{background:#10b981;border-color:#10b981;color:#0a0a0a;font-weight:600}
  button:hover{filter:brightness(1.1)}
  .meta{margin-top:16px;font-size:11px;color:#737373;font-family:ui-monospace,monospace;word-break:break-all}
</style></head><body>
<form method="POST" class="card">
  <h2>OAuth authorization</h2>
  <h1>Authorize <span class="client">${esc(clientId)}</span></h1>
  <p>This will let the app call <strong>rahman-resources-mcp</strong> on your behalf.</p>
  <ul>
    <li>Read-only access to the kitab manifest (templates, slices, recipes, skills)</li>
    <li>14 tools available — all return public data already shown on <a href="https://resource.rahmanef.com" style="color:#10b981">resource.rahmanef.com</a></li>
    <li>No personal data, no writes</li>
  </ul>
  ${inputs}
  <div class="actions">
    <button type="button" onclick="window.location='${esc(denyHref)}'">Deny</button>
    <button type="submit">Authorize</button>
  </div>
  <div class="meta">redirect: ${esc(redirectUri)}<br>resource: ${esc(resource)}<br>scope: ${esc(scope)}</div>
</form></body></html>`;
}
