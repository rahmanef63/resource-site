// MCP response/payload builders + slice composition helpers.

export function ok(value) {
  return { content: [{ type: "text", text: JSON.stringify(value, null, 2) }] };
}
export function text(value) {
  return { content: [{ type: "text", text: value }] };
}
export function errorResp(message) {
  return { content: [{ type: "text", text: `Error: ${message}` }], isError: true };
}
// Structured not-found: a JSON payload the calling LLM can branch on
// (input error, not infra error) with concrete recovery paths, instead of
// a bare "Not found: x" string it can only echo.
export function notFound(message, { didYouMean = [], tryTools = [] } = {}) {
  const payload = { error: "not_found", message };
  if (didYouMean.length) payload.didYouMean = didYouMean;
  if (tryTools.length) payload.try = tryTools;
  return {
    content: [{ type: "text", text: JSON.stringify(payload, null, 2) }],
    isError: true,
  };
}
export function resourceJson(uri, value) {
  return { contents: [{ uri, mimeType: "application/json", text: JSON.stringify(value, null, 2) }] };
}
export function resourceMarkdown(uri, markdown) {
  return { contents: [{ uri, mimeType: "text/markdown", text: markdown }] };
}
export function resourceError(uri, message) {
  return { contents: [{ uri, mimeType: "text/plain", text: `Error: ${message}` }] };
}

// Strip everything outside [a-z0-9-_] to render shell-safe args inside
// the npx command strings. Lossy by design — we'd rather mangle the slug
// than emit a `; rm -rf /` payload into the user's terminal.
export function sanitizeShellArg(s) {
  return String(s).replace(/[^a-z0-9-_]/gi, "-");
}

export function composeInit({ appName, template, features = [], skills = [] }) {
  const safe = String(appName ?? "my-app").replace(/[^a-z0-9-_]/gi, "-").toLowerCase() || "my-app";
  const parts = [`npx rahman-resources@latest init ${safe}`];
  if (template) parts.push(`--template ${sanitizeShellArg(template)}`);
  if (features.length) parts.push(`--features ${features.map(sanitizeShellArg).join(",")}`);
  if (skills.length) parts.push(`--skills ${skills.map(sanitizeShellArg).join(",")}`);
  return parts.join(" \\\n  ");
}

export function composeAdd({ template, features = [], skills = [] }) {
  const lines = ["# Run from the root of an existing rr.json project."];
  if (template) lines.push(`npx rahman-resources@latest add ${sanitizeShellArg(template)}`);
  for (const f of features) lines.push(`npx rahman-resources@latest add ${sanitizeShellArg(f)}`);
  for (const s of skills) lines.push(`npx rahman-resources@latest add-skill ${sanitizeShellArg(s)}`);
  if (lines.length === 1) lines.push("# (no items selected)");
  return lines.join("\n");
}

export function composeApp({ getManifest }, { app, template, slices = [] }) {
  const safeApp = sanitizeShellArg(String(app ?? "my-app"));
  const safeTemplate = template ? sanitizeShellArg(String(template)) : null;
  if (!Array.isArray(slices)) {
    return `⚠ slices must be an array (got ${typeof slices})`;
  }
  const m = getManifest();
  const sliceMap = new Map((m.slices ?? []).map((s) => [s.slug, s]));
  const requested = slices.filter((s) => sliceMap.has(s));
  const missing = slices.filter((s) => !sliceMap.has(s));

  const ordered = [];
  const seen = new Set();
  function visit(slug) {
    if (seen.has(slug)) return;
    seen.add(slug);
    const s = sliceMap.get(slug);
    if (!s) return;
    for (const p of s.peers ?? []) {
      if (sliceMap.has(p.slug)) visit(p.slug);
    }
    ordered.push(slug);
  }
  for (const s of requested) visit(s);

  const lines = [];
  const initCmd = safeTemplate
    ? `npx rahman-resources init ${safeApp} --template ${safeTemplate}`
    : `npx rahman-resources init ${safeApp}`;
  lines.push(initCmd);
  lines.push(`cd ${safeApp}`);
  for (const slug of ordered) {
    lines.push(`npx rahman-resources add ${sanitizeShellArg(slug)}`);
  }
  let out = lines.map((l) => `  ${l}`).join("\n");
  if (missing.length > 0) {
    out += `\n\n⚠ Unknown slice slugs ignored: ${missing.join(", ")}`;
  }
  const implicit = ordered.filter((s) => !requested.includes(s));
  if (implicit.length > 0) {
    out += `\n\nℹ Auto-added peers: ${implicit.join(", ")}`;
  }
  return out;
}

// SLICE_COMPAT mirror — keep in sync with site/lib/build/compat.ts.
const SLICE_COMPAT = {
  "midtrans-payment": { conflicts: ["stripe-payment", "doku-payment"] },
};

export function auditSlices({ getManifest }, { slices = [] }) {
  if (!Array.isArray(slices)) {
    return { errors: [`slices must be an array (got ${typeof slices})`], warnings: [], ok: false };
  }
  const m = getManifest();
  const sliceMap = new Map((m.slices ?? []).map((s) => [s.slug, s]));
  const errors = [];
  const warnings = [];
  const present = new Set(slices);

  for (const slug of slices) {
    const s = sliceMap.get(slug);
    if (!s) {
      warnings.push(`unknown slice: ${slug} (not in the rr manifest)`);
      continue;
    }
    for (const p of s.peers ?? []) {
      if (!present.has(p.slug) && sliceMap.has(p.slug)) {
        errors.push(`${slug} requires peer ${p.slug} ${p.range} — missing from selection`);
      }
    }
  }
  for (const slug of slices) {
    const compat = SLICE_COMPAT[slug];
    if (!compat?.conflicts) continue;
    for (const c of compat.conflicts) {
      if (present.has(c)) errors.push(`${slug} conflicts with ${c}`);
    }
  }
  return { errors, warnings, ok: errors.length === 0 };
}
