// compose-state.mjs — rr.json reader + strict-mode helper + repo-root finder.
//
// Extracted from compose.mjs.

import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

/**
 * Walk up from `start` looking for the directory that contains a `packages/`
 * folder + `package.json`. Falls back to cwd.
 */
export function findRepoRoot(start) {
  let dir = start;
  for (let i = 0; i < 8; i++) {
    if (
      existsSync(path.join(dir, "packages")) &&
      existsSync(path.join(dir, "package.json"))
    ) {
      return dir;
    }
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return process.cwd();
}

/**
 * Parse rr.json (if present) into a {@link RrJsonState}. Tolerates a
 * missing file by returning an empty state.
 *
 * Maps `rr.json#/auth.provider` to the solver's `auth` enum:
 *   "convex-auth" → "convex"
 *   "clerk" / "next-auth" / "none" → passthrough
 */
export function readStateFromRr(rrPath) {
  if (!existsSync(rrPath)) return {};
  let raw;
  try {
    raw = JSON.parse(readFileSync(rrPath, "utf8"));
  } catch {
    return {};
  }
  const provider = raw?.auth?.provider;
  const authMap = {
    "convex-auth": "convex",
    clerk: "clerk",
    "next-auth": "next-auth",
    none: "none",
  };
  const auth = provider ? authMap[provider] ?? undefined : undefined;

  const slicesInstalled = [
    ...(raw?.slices ?? []).map((s) => s.slug).filter(Boolean),
    ...(raw?.features ?? []).map((f) => f.slug).filter(Boolean),
  ];

  return {
    auth,
    slicesInstalled,
    envExisting: Array.isArray(raw?.envExisting) ? raw.envExisting : [],
    rbacRolesExisting: Array.isArray(raw?.rbacRolesExisting)
      ? raw.rbacRolesExisting
      : [],
    convexTablesExisting: Array.isArray(raw?.convexTablesExisting)
      ? raw.convexTablesExisting
      : [],
  };
}

export function hasBlocker(result) {
  return result.conflicts.some((c) => c.severity === "blocker");
}

/**
 * Elevate every `warning`-level conflict to `blocker`, then re-derive the
 * accepted / rejected sets so the slice that triggered any warning gets
 * rejected. Used for `--strict` / CI gating.
 *
 * @param {import("../lib/compose-solver").ComposeResult} result
 * @returns {import("../lib/compose-solver").ComposeResult}
 */
export function applyStrictMode(result) {
  const conflicts = result.conflicts.map((c) =>
    c.severity === "warning" ? { ...c, severity: "blocker" } : c,
  );
  const blockersBySlug = new Map();
  for (const c of conflicts) {
    if (c.severity !== "blocker") continue;
    const cur = blockersBySlug.get(c.slug) ?? [];
    cur.push(c);
    blockersBySlug.set(c.slug, cur);
  }
  const newRejected = [...result.rejected];
  const newAccepted = [];
  for (const slug of result.accepted) {
    const bl = blockersBySlug.get(slug);
    if (bl && bl.length > 0) {
      newRejected.push({ slug, reasons: bl, note: "strict-mode" });
    } else {
      newAccepted.push(slug);
    }
  }
  return { ...result, conflicts, accepted: newAccepted, rejected: newRejected };
}
