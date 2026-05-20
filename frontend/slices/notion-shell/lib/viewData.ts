/** Pure helpers — apply DatabaseViewConfig (filter + sort + search) to
 *  a row list. Caller owns row data + props; this only re-orders and
 *  filters. Used by every view component (Table / Board / List / etc.). */

import type {
  Database,
  DatabaseFilter,
  DatabaseSort,
  DatabaseViewConfig,
  Page,
  Property,
  PropertyValue,
} from "../types";

function asString(v: PropertyValue | undefined): string {
  if (v === null || v === undefined) return "";
  if (Array.isArray(v)) return v.join(", ");
  if (typeof v === "object") return JSON.stringify(v);
  return String(v);
}

function matchesFilter(
  row: Page,
  filter: DatabaseFilter,
  prop?: Property,
): boolean {
  const raw = row.rowProps?.[filter.propertyId];
  const text = asString(raw).toLowerCase();
  switch (filter.op) {
    case "contains":
      return text.includes((filter.value ?? "").toLowerCase());
    case "equals":
      return text === (filter.value ?? "").toLowerCase();
    case "is_empty":
      return raw === null || raw === undefined || text === "";
    case "not_empty":
      return raw !== null && raw !== undefined && text !== "";
    case "checked":
      return raw === true;
    case "unchecked":
      return raw === false || raw === null || raw === undefined;
    default:
      void prop;
      return true;
  }
}

function matchesSearch(row: Page, q: string, props: Property[]): boolean {
  if (!q) return true;
  const needle = q.toLowerCase();
  if (row.title.toLowerCase().includes(needle)) return true;
  for (const p of props) {
    const v = asString(row.rowProps?.[p.id]);
    if (v.toLowerCase().includes(needle)) return true;
  }
  return false;
}

function compare(a: PropertyValue | undefined, b: PropertyValue | undefined): number {
  if (a === null || a === undefined) return b === null || b === undefined ? 0 : -1;
  if (b === null || b === undefined) return 1;
  if (typeof a === "number" && typeof b === "number") return a - b;
  return asString(a).localeCompare(asString(b));
}

export function applyView(
  rows: Page[],
  db: Database,
  view: DatabaseViewConfig,
): Page[] {
  const propMap = new Map(db.properties.map((p) => [p.id, p]));
  let out = rows;

  for (const f of view.filters ?? []) {
    out = out.filter((r) => matchesFilter(r, f, propMap.get(f.propertyId)));
  }

  if (view.search) {
    out = out.filter((r) => matchesSearch(r, view.search, db.properties));
  }

  const sorts = view.sorts ?? [];
  if (sorts.length > 0) {
    out = [...out].sort((a, b) => {
      for (const s of sorts) {
        const av = a.rowProps?.[s.propertyId] ?? null;
        const bv = b.rowProps?.[s.propertyId] ?? null;
        const cmp = compare(av, bv);
        if (cmp !== 0) return s.direction === "asc" ? cmp : -cmp;
      }
      return 0;
    });
  }

  return out;
}

/** Group rows by a select-shaped property's value id. `null` bucket is
 *  for rows with no value. Used by BoardView. */
export function groupBy(
  rows: Page[],
  prop: Property,
): Array<{ key: string | null; label: string; color: string; rows: Page[] }> {
  const buckets = new Map<string | null, Page[]>();
  for (const r of rows) {
    const raw = r.rowProps?.[prop.id];
    const k = typeof raw === "string" ? raw : null;
    if (!buckets.has(k)) buckets.set(k, []);
    buckets.get(k)!.push(r);
  }
  const out: Array<{ key: string | null; label: string; color: string; rows: Page[] }> = [];
  if (buckets.has(null)) {
    out.push({ key: null, label: "No value", color: "muted", rows: buckets.get(null)! });
  }
  for (const opt of prop.options ?? []) {
    const rs = buckets.get(opt.id);
    if (rs) out.push({ key: opt.id, label: opt.name, color: opt.color, rows: rs });
  }
  return out;
}

/** Bucket rows into a month grid keyed by `YYYY-MM-DD`. Used by
 *  CalendarView. `prop` must be a date-shaped property. */
export function bucketByDate(
  rows: Page[],
  prop: Property,
): Map<string, Page[]> {
  const out = new Map<string, Page[]>();
  for (const r of rows) {
    const raw = r.rowProps?.[prop.id];
    const date =
      typeof raw === "object" && raw && "date" in raw && raw.date
        ? raw.date
        : null;
    if (!date) continue;
    const key = String(date).slice(0, 10);
    if (!out.has(key)) out.set(key, []);
    out.get(key)!.push(r);
  }
  return out;
}
