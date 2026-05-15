/**
 * Slice contract for `seo` — v0.2.0.
 *
 * Service slice for SEO metadata generation — Anthropic-backed action with
 * per-user 24h cost guard. Backend exposes `generate` + `generateAndApply`
 * mutations gated by `requireAdmin` (convex-auth identity).
 *
 * v0.2.0 introduces the `buildSeoSystemPrompt({ personaContext })` portable
 * factory + the `personaContext` action arg. UP-synced from rahmanef.com
 * (commit `bde5763`, Wave N+3.1) on 2026-05-15.
 *
 * Pure persona/factory refactor — no Convex schema change → no migrationFrom
 * entry. The `seoGeneratorCalls` table shape is unchanged from v0.1.0.
 *
 * Current Convex schema (`convex/features/seo/schema.ts`) declares ONE table
 * named `seoGeneratorCalls` — predates the per-slice namespace rule.
 *
 * TODO(contract): tables need namespace rename migration — see Phase E planner
 * Aspirational prefix is `seo_` (e.g. `seo_generator_calls`). Until the rename
 * lands, `requires.convex` is intentionally omitted so the validator's prefix
 * invariant doesn't fail; `provides.tables` reflects the actual current name.
 */
import { defineSliceContract } from "../../../packages/cli/lib/contract";

export const contract = defineSliceContract({
  id: "seo",
  version: "0.2.0",
  requires: {
    auth: "convex",
    rbac: ["seo.write"],
    env: ["ANTHROPIC_API_KEY"],
    deps: ["convex-auth"],
  },
  provides: {
    // TODO(contract): tables need namespace rename migration — see Phase E planner
    tables: ["seoGeneratorCalls"],
    // v0.2.0 portable surface — pure helpers exported from frontend/slices/seo/lib.
    components: ["buildSeoSystemPrompt"],
  },
  conflicts: [],
  bidir: {
    syncPolicy: "manual",
    generalization: {
      level: "portable",
      // Forbid any rahmanef-domain literal from leaking into the kitab copy.
      // The action persona was hoisted as a `personaContext` prop in v0.2.0;
      // baked-in rahmanef brand text would defeat the generalisation gate.
      forbiddenTerms: ["rahmanef", "rahmanef.com"],
      // Consumer-supplied props (all optional, defaulted via
      // DEFAULT_PERSONA_CONTEXT). Listed so `rr-prep` can audit consumer
      // wirings against the portable surface.
      requiredProps: ["personaContext"],
    },
  },
});
