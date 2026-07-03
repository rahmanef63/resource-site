/**
 * Admin slice — pure-async stats factory.
 *
 * Walks every entry in `sliceRegistry`, reads rows via `queryTable`, and
 * emits the same `{ counts, unreadMessages, activity }` shape Convex's
 * `admin.stats` query returns. No React / Next / Convex imports.
 */

import type {
  AdminStats,
  AdminTableRow,
  BuildAdminStatsOpts,
  SliceAdminActivityEntry,
} from "./registry-types";

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
 * Pure-async admin dashboard factory.
 *
 * Properties:
 *   - Deterministic: registry order is preserved; rows are sorted by
 *     `createdAt` DESC then registry insertion order on ties.
 *   - Idempotent: pure read; never mutates inputs.
 *   - Lenient by default: a missing table is treated as empty (rahmanef
 *     parity). Pass `strict: true` to surface reader errors.
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
