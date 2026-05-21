"use client";

/** SelectCell — single-pick dropdown for select / status property types.
 *  Read-only mode renders a colored chip. */

import { cn } from "@/lib/utils";
import type { SelectOption } from "../../types";

interface SelectCellProps {
  options: SelectOption[];
  value: string | null;
  readOnly?: boolean;
  onChange?: (next: string | null) => void;
}

export function SelectCell({ options, value, readOnly, onChange }: SelectCellProps) {
  const opt = options.find((o) => o.id === value);

  if (readOnly) {
    return opt ? (
      <span className={cn(
        "inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-foreground",
      )}>
        {opt.name}
      </span>
    ) : (
      <span className="text-muted-foreground/60">—</span>
    );
  }

  return (
    <select
      value={value ?? ""}
      onChange={(e) => onChange?.(e.target.value || null)}
      className="h-7 w-full rounded-md border border-border bg-background px-2 text-sm"
    >
      <option value="">—</option>
      {options.map((o) => (
        <option key={o.id} value={o.id}>{o.name}</option>
      ))}
    </select>
  );
}
