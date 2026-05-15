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
 */

/**
 * Declarative entry describing how a slice surfaces in the admin slice's
 * dashboard (counts panel + recent-activity feed).
 *
 * Mirrors rahmanef's `SliceAdminActivityEntry`. Each consumer slice that
 * wants to surface in the admin dashboard ships ONE of these in its
 * `config.ts`; the consumer's slice registry then flat-maps every slice's
 * declarations into a single list that the admin factory walks.
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
 * UI strings consumed by the admin shell. Hoisted so consumers can localise
 * without forking the slice. All entries optional; missing entries fall back
 * to {@link DEFAULT_ADMIN_LABELS}.
 */
export type SliceAdminLabels = {
  /** Page heading (e.g. `"Admin"`). */
  title?: string;
  /** Sub-heading below the page title. */
  subtitle?: string;
  /** Card title when no slice surfaces panels. */
  emptyHeading?: string;
  /** Empty-state body text. */
  emptyBody?: string;
};

/**
 * Default UI strings. Generic — NO consumer-domain literals. Consumers
 * override via the `labels` prop to localise / rebrand.
 */
export const DEFAULT_ADMIN_LABELS: Required<SliceAdminLabels> = {
  title: "Admin",
  subtitle:
    "Workspace management surface. Wire panels via slice composition.",
  emptyHeading: "No panels mounted",
  emptyBody:
    "Consumer projects compose panels here. See `convex/features/admin/queries.ts` for the admin probe + counts API.",
};

/**
 * Minimal row shape the {@link buildAdminStats} factory expects.
 *
 * Real consumers will likely have richer row shapes; the factory only
 * reads `_id` (required), `_creationTime` / `createdAt` (for sort), and the
 * fields named in each entry's {@link SliceAdminActivityEntry.titleFields}.
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
 * Options for {@link buildAdminStats}.
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
   * treated as empty. The original `rahmanef.com` implementation defaulted
   * to lenient so a schema-table mismatch couldn't break the whole panel.
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

/**
 * Pick the first non-empty string field on a row. Used for activity titles.
 *
 * @example
 * pickTitle({ name: "", email: "a@b.co" }, ["name", "email"], "—")
 * // => "a@b.co"
 */
export function pickTitle(
  row: AdminTableRow,
  fields: readonly string[],
  fallback: string,
): string {
  for (const f of fields) {
    const v = row[f];
    if (typeof v === "string" && v.trim().length > 0) return v;
  }
  return fallback;
}

/**
 * Distinct list of Convex table names that need a count read for the
 * dashboard. Derived from the flat entries list — duplicates are dropped.
 */
export function deriveCountTables(
  entries: readonly SliceAdminActivityEntry[],
): readonly string[] {
  return Array.from(new Set(entries.map((e) => e.table)));
}

/**
 * Resolve labels — caller supplied keys win, missing keys default.
 */
export function resolveAdminLabels(
  labels?: SliceAdminLabels,
): Required<SliceAdminLabels> {
  return {
    title: labels?.title ?? DEFAULT_ADMIN_LABELS.title,
    subtitle: labels?.subtitle ?? DEFAULT_ADMIN_LABELS.subtitle,
    emptyHeading: labels?.emptyHeading ?? DEFAULT_ADMIN_LABELS.emptyHeading,
    emptyBody: labels?.emptyBody ?? DEFAULT_ADMIN_LABELS.emptyBody,
  };
}

/**
 * Pure-async admin dashboard factory.
 *
 * Walks every entry in `sliceRegistry`, reads rows via `queryTable`, and
 * emits the same `{ counts, unreadMessages, activity }` shape Convex's
 * `admin.stats` query returns.
 *
 * Properties:
 *   - Deterministic: registry order is preserved; rows are sorted by
 *     `createdAt` DESC then registry insertion order on ties.
 *   - Idempotent: pure read; never mutates inputs.
 *   - Lenient by default: a missing table is treated as empty (rahmanef
 *     parity). Pass `strict: true` to surface reader errors.
 *
 * @example
 * const stats = await buildAdminStats({
 *   sliceRegistry: { entries: [{ table: "posts", kind: "blog", ... }] },
 *   queryTable: async (t) => await ctx.db.query(t).collect(),
 * })
 */
export async function buildAdminStats(
  opts: BuildAdminStatsOpts,
): Promise<AdminStats> {
  const { sliceRegistry, queryTable, activityLimit = 12, strict = false } =
    opts;
  const entries = sliceRegistry.entries;
  const countTables = deriveCountTables(entries);

  const counts: Record<string, number> = {};
  for (const table of countTables) {
    try {
      const rows = await queryTable(table);
      counts[table] = rows.length;
    } catch (err) {
      if (strict) throw err;
      counts[table] = 0;
    }
  }

  let unreadMessages = 0;
  for (const entry of entries) {
    if (!entry.unreadField) continue;
    try {
      const rows = await queryTable(entry.table);
      unreadMessages += rows.filter(
        (r) => !(r as Record<string, unknown>)[entry.unreadField as string],
      ).length;
    } catch (err) {
      if (strict) throw err;
      // table missing in schema — skip silently
    }
  }

  const merged: Array<{
    id: string;
    kind: string;
    label: string;
    href: string;
    title: string;
    createdAt: number;
  }> = [];

  for (const entry of entries) {
    let rows: readonly AdminTableRow[] = [];
    try {
      rows = await queryTable(entry.table);
    } catch (err) {
      if (strict) throw err;
      rows = [];
    }
    for (const row of rows) {
      merged.push({
        id: row._id,
        kind: entry.kind,
        label: entry.label,
        href: entry.href,
        title: pickTitle(row, entry.titleFields, entry.titleFallback),
        createdAt:
          (typeof row.createdAt === "number" ? row.createdAt : undefined) ??
          row._creationTime ??
          0,
      });
    }
  }

  merged.sort((a, b) => b.createdAt - a.createdAt);
  const activity = merged.slice(0, activityLimit);

  return { counts, unreadMessages, activity };
}
