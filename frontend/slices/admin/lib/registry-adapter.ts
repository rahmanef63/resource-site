/**
 * Admin slice — v0.2.0 portable surface (`nav-from-registry`).
 *
 * UP-synced from rahmanef.com (commit `b542389`, Wave N+3.1) on 2026-05-15.
 * Rahmanef's slice declared a slice-registry that flattens each slice's
 * `admin.activity[]` declarations into a single feed; the admin slice then
 * derives its count/activity dashboard from those entries instead of carrying
 * a hardcoded list of consumer-specific tables and routes.
 *
 * The kitab adopts the SAME contract — but with a generalised vocabulary:
 *
 *   - `SliceAdminActivityEntry`   — what a slice declares about itself.
 *   - `SliceRegistryAdapter`      — the consumer supplies a flat list of
 *                                    activity entries (typically derived
 *                                    from their feature registry).
 *   - `SliceAdminLabels`          — UI strings (i18n hook). Defaulted via
 *                                    `DEFAULT_ADMIN_LABELS`.
 *   - `AdminCountTableReader`     — consumer-supplied function that reads
 *                                    rows from a Convex table by name. Pure
 *                                    seam so this module stays React-/Convex-
 *                                    free and runs inside vitest.
 *   - `buildAdminStats(opts)`     — pure async factory; returns the same
 *                                    `{ counts, unreadMessages, activity }`
 *                                    shape kitab's `convex/features/admin`
 *                                    query already returns.
 *
 * NO consumer-domain literals leak in here. The defaults are intentionally
 * generic placeholders; consumers MUST supply their own `sliceRegistry`
 * (entries) and a `queryTable` reader. The contract's `forbiddenTerms` array
 * gates this module against drift.
 *
 * Pure module — no React, no Next, no Convex imports.
 *
 * Split into 3 sibling modules (re-exported here for back-compat):
 *   - `./registry-types`   — type vocabulary
 *   - `./registry-labels`  — UI strings + label resolver
 *   - `./registry-stats`   — pickTitle, deriveCountTables, buildAdminStats
 */

export type {
  AdminCountTableReader,
  AdminStats,
  AdminTableRow,
  BuildAdminStatsOpts,
  SliceAdminActivityEntry,
  SliceRegistryAdapter,
} from "./registry-types";

export {
  DEFAULT_ADMIN_LABELS,
  resolveAdminLabels,
  type SliceAdminLabels,
} from "./registry-labels";

export {
  buildAdminStats,
  deriveCountTables,
  pickTitle,
} from "./registry-stats";
