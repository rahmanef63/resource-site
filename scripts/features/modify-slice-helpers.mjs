// Helpers for modify-slice.mjs — pure string/array operations on the
// SliceEntry literal inside lib/content/slices.ts.

export function locateEntry(src, slug) {
  // Find `slug: "<slug>",` then walk back to opening `{` and forward to its match.
  const needle = `slug: "${slug}"`;
  const slugIdx = src.indexOf(needle);
  if (slugIdx === -1) return null;
  let i = slugIdx;
  while (i > 0 && src[i] !== "{") i--;
  if (src[i] !== "{") return null;
  const start = i;
  let depth = 0;
  for (let j = start; j < src.length; j++) {
    if (src[j] === "{") depth++;
    else if (src[j] === "}") {
      depth--;
      if (depth === 0) {
        let end = j + 1;
        if (src[end] === ",") end++;
        if (src[end] === "\n") end++;
        return { start, end };
      }
    }
  }
  return null;
}

export function patchArrayField(body, field, values) {
  const literal = `[${values.map((v) => JSON.stringify(v)).join(", ")}]`;
  const startRe = new RegExp(`\\b${field}\\s*:\\s*\\[`);
  const m = body.match(startRe);
  if (!m) return insertField(body, `${field}: ${literal}`);
  const start = m.index + m[0].length - 1;
  const end = matchBracket(body, start, "[", "]");
  if (end === -1) return insertField(body, `${field}: ${literal}`);
  return body.slice(0, start) + literal + body.slice(end + 1);
}

export function patchObjectArrayField(body, field, values) {
  const literal = serializeObjectArray(values);
  const startRe = new RegExp(`\\b${field}\\s*:\\s*\\[`);
  const m = body.match(startRe);
  if (!m) return insertField(body, `${field}: ${literal}`);
  const start = m.index + m[0].length - 1;
  const end = matchBracket(body, start, "[", "]");
  if (end === -1) return insertField(body, `${field}: ${literal}`);
  return body.slice(0, start) + literal + body.slice(end + 1);
}

export function patchStringField(body, field, value) {
  const literal = JSON.stringify(value);
  const re = new RegExp(`(\\b${field}\\s*:\\s*)"[^"]*"`);
  if (re.test(body)) return body.replace(re, `$1${literal}`);
  return insertField(body, `${field}: ${literal}`);
}

export function insertField(body, kvLine) {
  const closeIdx = body.lastIndexOf("}");
  if (closeIdx === -1) return body;
  const before = body.slice(0, closeIdx);
  const after = body.slice(closeIdx);
  const indent = (before.match(/\n(\s+)[a-zA-Z]+:/g) ?? ["    "]).pop()?.match(/\n(\s+)/)?.[1] ?? "    ";
  return `${before}${indent}${kvLine},\n${" ".repeat(Math.max(0, indent.length - 2))}${after}`;
}

export function matchBracket(body, openIdx, open, close) {
  let depth = 0;
  for (let i = openIdx; i < body.length; i++) {
    if (body[i] === open) depth++;
    else if (body[i] === close) {
      depth--;
      if (depth === 0) return i;
    }
  }
  return -1;
}

export function serializeObjectArray(arr) {
  if (arr.length === 0) return "[]";
  const parts = arr.map((o) => {
    const fields = Object.entries(o)
      .map(([k, v]) => `${k}: ${JSON.stringify(v)}`)
      .join(", ");
    return `{ ${fields} }`;
  });
  return `[${parts.join(", ")}]`;
}

export function uniqMerge(a, b) {
  return [...new Set([...a, ...b])];
}

export function mergeBy(a, b, key) {
  const out = [...a];
  for (const item of b) {
    const idx = out.findIndex((x) => x[key] === item[key]);
    if (idx === -1) out.push(item);
    else out[idx] = { ...out[idx], ...item };
  }
  return out;
}

export function bumpSemver(v, level, failFn) {
  const m = String(v).match(/^(\d+)\.(\d+)\.(\d+)(?:-.*)?$/);
  if (!m) failFn(`Invalid semver: "${v}"`);
  let [, maj, min, pat] = m;
  let M = +maj, mn = +min, p = +pat;
  if (level === "major") { M++; mn = 0; p = 0; }
  else if (level === "minor") { mn++; p = 0; }
  else if (level === "patch") { p++; }
  else failFn(`--bump must be patch|minor|major`);
  return `${M}.${mn}.${p}`;
}

export function csv(s) {
  if (!s || s === true) return [];
  return String(s).split(",").map((x) => x.trim()).filter(Boolean);
}

export function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith("--")) continue;
    const key = a.slice(2);
    const next = argv[i + 1];
    if (next && !next.startsWith("--")) { out[key] = next; i++; }
    else out[key] = true;
  }
  return out;
}
