"use client";

/** Per-type property cell renderers. Split out of NotionProperty so
 *  each type's UI fits in one section and new types can be added
 *  without ballooning the parent. Pure controlled inputs — every
 *  cell takes `value` + `onChange` + `prop` (for options) +
 *  `readOnly`. Returns a ReactNode the host slots inline. */

import type { ReactNode } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { cn } from "rahman-shared/lib/utils";
import type { Property, PropertyValue, SelectOption } from "../types";

interface CellArgs {
  prop: Property;
  value: PropertyValue;
  readOnly: boolean;
  onChange?: (next: PropertyValue) => void;
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

export function renderPropertyCell({ prop, value, readOnly, onChange }: CellArgs): ReactNode {
  switch (prop.type) {
    case "checkbox":
      return (
        <Checkbox
          checked={!!value}
          disabled={readOnly}
          onCheckedChange={(v) => onChange?.(!!v)}
        />
      );

    case "number":
      return (
        <Input
          type="number"
          value={(value as number | null) ?? ""}
          disabled={readOnly}
          onChange={(e) => onChange?.(e.target.value === "" ? null : Number(e.target.value))}
          className="h-7 text-sm"
        />
      );

    case "select":
    case "status": {
      const id = value as string | null;
      const opt = prop.options?.find((o) => o.id === id);
      if (readOnly) return optChip(opt) ?? <span className="text-muted-foreground/60">—</span>;
      return (
        <select
          value={id ?? ""}
          onChange={(e) => onChange?.(e.target.value || null)}
          className="h-7 w-full rounded-md border border-border bg-background px-2 text-sm"
        >
          <option value="">—</option>
          {prop.options?.map((o) => (
            <option key={o.id} value={o.id}>{o.name}</option>
          ))}
        </select>
      );
    }

    case "multi_select": {
      const ids = (Array.isArray(value) ? value : []) as string[];
      const selected = (prop.options ?? []).filter((o) => ids.includes(o.id));
      if (readOnly) {
        return (
          <div className="flex flex-wrap gap-1">
            {selected.map((o) => optChip(o, "bg-primary/15 text-primary"))}
          </div>
        );
      }
      return (
        <div className="flex flex-wrap items-center gap-1">
          {(prop.options ?? []).map((o) => {
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
                  active ? "border-primary bg-primary/15 text-primary" : "border-border text-muted-foreground",
                )}
              >
                {o.name}
              </button>
            );
          })}
        </div>
      );
    }

    case "date": {
      const v = (value && typeof value === "object" && "date" in value ? value.date : null) ?? "";
      return (
        <Input
          type="date"
          value={String(v)}
          disabled={readOnly}
          onChange={(e) => onChange?.(e.target.value ? { date: e.target.value } : null)}
          className="h-7 text-sm"
        />
      );
    }

    case "url":
      return (
        <Input
          type="url"
          inputMode="url"
          value={String(value ?? "")}
          disabled={readOnly}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder="https://…"
          className="h-7 text-sm"
        />
      );

    case "email":
      return (
        <Input
          type="email"
          inputMode="email"
          value={String(value ?? "")}
          disabled={readOnly}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder="name@example.com"
          className="h-7 text-sm"
        />
      );

    case "phone":
      return (
        <Input
          type="tel"
          inputMode="tel"
          value={String(value ?? "")}
          disabled={readOnly}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder="+62…"
          className="h-7 text-sm"
        />
      );

    default:
      return (
        <Input
          value={String(value ?? "")}
          disabled={readOnly}
          onChange={(e) => onChange?.(e.target.value)}
          className="h-7 text-sm"
        />
      );
  }
}
