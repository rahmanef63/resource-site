/**
 * Admin slice — shared type vocabulary for the registry-driven dashboard.
 *
 * Mirrors rahmanef's `SliceAdminActivityEntry`. Each consumer slice that
 * wants to surface in the admin dashboard ships ONE of these in its
 * `config.ts`; the consumer's slice registry then flat-maps every slice's
 * declarations into a single list that the admin factory walks.
 *
 * Pure types — no React, no Next, no Convex imports.
 */

/**
 * Declarative entry describing how a slice surfaces in the admin slice's
 * dashboard (counts panel + recent-activity feed).
 */
export type SliceAdminActivityEntry = {
  /** Convex table name to query. Must exist in the aggregated schema. */
  table: string;
  /** Stable discriminator (e.g. `"portfolio"`, `"blog"`, `"service"`). */
  kind: string;
  /** Short label rendered next to the activity row. */
  label: string;
  /** Admin route this row links to. */
  href: string;
  /**
   * Field names to try (in order) for the activity title. First non-empty
   * string wins; falls back to {@link titleFallback}.
   */
  titleFields: readonly string[];
  /** Fallback when every titleField is empty. */
  titleFallback: string;
  /**
   * If set, this table feeds the unread-message count: rows where the named
   * boolean field is `false` / missing are counted as unread. Used by
   * inbox-shaped slices (contact submissions, support tickets, etc).
   */
  unreadField?: string;
};

/**
 * Consumer-supplied slice registry adapter.
 *
 * Hosted apps typically derive `entries` from their feature registry —
 * each slice's `config.ts` declares its own `admin.activity[]` rows, and
 * the registry flattens them. The admin slice itself never imports a
 * consumer's slice list directly; it only reads through this adapter.
 */
export type SliceRegistryAdapter = {
  /**
   * Flat, deterministically-ordered list of activity entries from every
   * slice in the consumer's registry. Order is preserved into the merged
   * activity feed when timestamps tie.
   */
  entries: readonly SliceAdminActivityEntry[];
};

/**
 * Minimal row shape the {@link buildAdminStats} factory expects.
 */
export type AdminTableRow = Record<string, unknown> & {
  _id: string;
  _creationTime?: number;
  createdAt?: number;
};

/**
 * Consumer-supplied seam for reading rows from a Convex table by name.
 *
 * Kept generic so this module remains testable in vitest without a Convex
 * runtime. Production consumers wire this to `ctx.db.query(table).collect()`
 * inside their `convex/features/admin/queries.ts`.
 */
export type AdminCountTableReader = (
  table: string,
) => Promise<readonly AdminTableRow[]>;

/**
 * Options for `buildAdminStats`.
 */
export type BuildAdminStatsOpts = {
  /** Consumer-supplied slice registry adapter. */
  sliceRegistry: SliceRegistryAdapter;
  /** Consumer-supplied table reader (Convex `ctx.db.query(...).collect()`). */
  queryTable: AdminCountTableReader;
  /** Maximum number of activity rows surfaced. Defaults to `12`. */
  activityLimit?: number;
  /**
   * Strict mode — when `true`, errors thrown by `queryTable` bubble up. When
   * `false` (default) per-table errors are swallowed and the entry is
   * treated as empty.
   */
  strict?: boolean;
};

/**
 * Return shape — identical to the Convex `admin.stats` query.
 */
export type AdminStats = {
  counts: Record<string, number>;
  unreadMessages: number;
  activity: ReadonlyArray<{
    id: string;
    kind: string;
    label: string;
    href: string;
    title: string;
    createdAt: number;
  }>;
};
