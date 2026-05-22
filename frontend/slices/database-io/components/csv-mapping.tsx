"use client";

/** CSV → property mapping editor. One row per detected column. */

import type { Database } from "../types";

const SKIP = "__skip__";
const TITLE = "__title__";
const NEW_PREFIX = "__new:";

export const CSV_SKIP = SKIP;
export const CSV_TITLE = TITLE;
export const CSV_NEW_PREFIX = NEW_PREFIX;

export const NEW_TYPES = [
  "text", "number", "select", "multi_select", "status", "date",
  "person", "checkbox", "url", "email", "phone", "files",
] as const;

export function CsvMapping({
  db, headers, mapping, onSet,
}: {
  db: Database;
  headers: string[];
  mapping: Record<number, string>;
  onSet: (col: number, value: string) => void;
}) {
  return (
    <div className="max-h-[420px] space-y-2 overflow-y-auto">
      <div className="text-xs text-muted-foreground">
        {headers.length} columns detected — map each to a property below.
      </div>
      {headers.map((h, i) => (
        <div key={i} className="flex items-center gap-2 text-sm">
          <span className="flex-1 truncate font-medium">{h || `Column ${i + 1}`}</span>
          <span className="text-muted-foreground">→</span>
          <select
            value={mapping[i] ?? SKIP}
            onChange={(e) => onSet(i, e.target.value)}
            className="min-w-48 rounded border border-border bg-background px-2 py-1 text-xs"
          >
            <option value={SKIP}>(skip)</option>
            <option value={TITLE}>Title</option>
            <optgroup label="Existing properties">
              {db.properties.map((p) => (
                <option key={p.id} value={p.id}>{p.name} · {p.type}</option>
              ))}
            </optgroup>
            <optgroup label="+ Create new property">
              {NEW_TYPES.map((t) => (
                <option key={t} value={`${NEW_PREFIX}${t}`}>+ New · {t}</option>
              ))}
            </optgroup>
          </select>
        </div>
      ))}
    </div>
  );
}
