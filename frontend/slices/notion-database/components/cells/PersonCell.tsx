"use client";

/** PersonCell — array of person identifiers (string ids or names).
 *  Simplified vs upstream Notion: no user directory lookup. Display as
 *  avatar-initials chips; edit via comma-separated text input. Host can
 *  layer a richer picker by intercepting `value` at the wrapper level. */

import { useState } from "react";
import { Users, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";

interface PersonCellProps {
  value: string[];
  readOnly?: boolean;
  onChange?: (next: string[]) => void;
}

function initials(name: string): string {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase() ?? "").join("");
}

export function PersonCell({ value, readOnly, onChange }: PersonCellProps) {
  const people = Array.isArray(value) ? value : [];
  const [draft, setDraft] = useState("");

  const remove = (id: string) => onChange?.(people.filter((p) => p !== id));
  const commit = () => {
    const next = draft
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (next.length) onChange?.([...people, ...next]);
    setDraft("");
  };

  const chips = (
    <div className="flex flex-wrap items-center gap-1">
      {people.map((p) => (
        <span
          key={p}
          className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-1.5 py-0.5 text-[10px]"
        >
          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary/15 text-[8px] font-semibold text-primary">
            {initials(p)}
          </span>
          <span className="max-w-[80px] truncate">{p}</span>
          {!readOnly && (
            <button
              type="button"
              onClick={() => remove(p)}
              className="rounded text-muted-foreground hover:bg-accent"
              aria-label={`Remove ${p}`}
            >
              <X className="h-2.5 w-2.5" />
            </button>
          )}
        </span>
      ))}
      {people.length === 0 && <span className="text-xs text-muted-foreground/60">—</span>}
    </div>
  );

  if (readOnly) return chips;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn("flex w-full items-center gap-1 rounded px-2 py-1 text-left hover:bg-accent/50")}
        >
          <Users className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          {chips}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-2" align="start">
        <form onSubmit={(e) => { e.preventDefault(); commit(); }} className="flex gap-1">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Name, name…"
            className="h-7 flex-1 rounded-md border border-border bg-background px-2 text-xs"
          />
          <button
            type="submit"
            className="rounded-md border border-border px-2 py-1 text-xs hover:bg-accent"
          >
            Add
          </button>
        </form>
      </PopoverContent>
    </Popover>
  );
}
