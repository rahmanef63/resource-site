/**
 * Slice contract for `documents` — v1.2.0.
 *
 * Auto-generated stub. Fill in `provides.components` and refine
 * `requires.rbac` / `requires.env` once the public API is stable.
 *
 * Standalone (no defineSliceContract helper required) — keeps the
 * slice portable across repos.
 */
export const contract = {
  id: "documents",
  version: "1.2.0",
  requires: {
    auth: "convex" as const,
    rbac: [] as string[],
    env: [] as string[],
    deps: [] as const,
  },
  provides: {
    components: [] as string[],
  },
  conflicts: [] as string[],
  bidir: {
    syncPolicy: "manual" as const,
    generalization: {
      level: "portable" as const,
      forbiddenTerms: ["rahmanef", "rahmanef.com"] as string[],
      requiredProps: [] as string[],
    },
  },
} as const;
