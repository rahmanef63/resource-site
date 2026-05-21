"use client";

/** MultiSelectCell — chip toggle for multi-select option props. */

import { cn } from "@/lib/utils";
import type { SelectOption } from "../../types";

interface MultiSelectCellProps {
  options: SelectOption[];
  value: string[];
  readOnly?: boolean;
  onChange?: (next: string[]) => void;
}

function optChip(opt: SelectOption | undefined, className?: string) {
  if (!opt) return null;
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium",
        "bg-muted text-foreground",
        className,
      )}
    >
      {opt.name}
    </span>
  );
}

export function MultiSelectCell({ options, value, readOnly, onChange }: MultiSelectCellProps) {
  const ids = Array.isArray(value) ? value : [];
  const selected = options.filter((o) => ids.includes(o.id));

  if (readOnly) {
    return (
      <div className="flex flex-wrap gap-1">
        {selected.map((o) => optChip(o, "bg-primary/15 text-primary"))}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-1">
      {options.map((o) => {
        const active = ids.includes(o.id);
        return (
          <button
            key={o.id}
            type="button"
            onClick={() => {
              const next = active ? ids.filter((x) => x !== o.id) : [...ids, o.id];
              onChange?.(next);
            }}
            className={cn(
              "rounded-full border px-2 py-0.5 text-[10px]",
              active
                ? "border-primary bg-primary/15 text-primary"
                : "border-border text-muted-foreground",
            )}
          >
            {o.name}
          </button>
        );
      })}
    </div>
  );
}
