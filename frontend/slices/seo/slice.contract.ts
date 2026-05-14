/**
 * Slice contract for `seo` — Phase A.
 *
 * Service slice for SEO metadata generation — Anthropic-backed action with
 * per-user 24h cost guard. Backend exposes `generate` + `generateAndApply`
 * mutations gated by `requireAdmin` (convex-auth identity).
 *
 * Current Convex schema (`convex/features/seo/schema.ts`) declares ONE table
 * named `seoGeneratorCalls` — predates the per-slice namespace rule.
 *
 * TODO(contract): tables need namespace rename migration — see Phase E planner
 * Aspirational prefix is `seo_` (e.g. `seo_generator_calls`). Until the rename
 * lands, `requires.convex` is intentionally omitted so the validator's prefix
 * invariant doesn't fail; `provides.tables` reflects the actual current name.
 *
 * Backfilled from `slice.json` 2026-05-14 (Track H3 — new slice.json schema).
 */
import { defineSliceContract } from "../../../packages/cli/lib/contract";

export const contract = defineSliceContract({
  id: "seo",
  version: "0.1.0",
  requires: {
    auth: "convex",
    rbac: ["seo.write"],
    env: ["ANTHROPIC_API_KEY"],
    deps: ["convex-auth"],
  },
  provides: {
    // TODO(contract): tables need namespace rename migration — see Phase E planner
    tables: ["seoGeneratorCalls"],
  },
  conflicts: [],
});
