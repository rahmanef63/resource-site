"use client";

/** FilterBuilder — popover UI for a view's filter list. Pure props —
 *  parent owns persistence (DatabaseViewConfig.filters). Filters apply
 *  AND-style (every row must match every filter). */

import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import type { Database, DatabaseFilter } from "../types";

const OPS: { value: DatabaseFilter["op"]; label: string; needsValue: boolean }[] = [
  { value: "contains",  label: "contains",       needsValue: true },
  { value: "equals",    label: "equals",         needsValue: true },
  { value: "not_empty", label: "is not empty",   needsValue: false },
  { value: "is_empty",  label: "is empty",       needsValue: false },
  { value: "checked",   label: "is checked",     needsValue: false },
  { value: "unchecked", label: "is unchecked",   needsValue: false },
];

export interface FilterBuilderProps {
  db: Database;
  filters: DatabaseFilter[];
  onChange: (next: DatabaseFilter[]) => void;
}

export function FilterBuilder({ db, filters, onChange }: FilterBuilderProps) {
  const addFilter = () => {
    const prop = db.properties[0];
    if (!prop) return;
    onChange([...filters, { propertyId: prop.id, op: "contains", value: "" }]);
  };
  const remove = (i: number) => onChange(filters.filter((_, j) => j !== i));
  const update = (i: number, patch: Partial<DatabaseFilter>) =>
    onChange(filters.map((f, j) => (j === i ? { ...f, ...patch } : f)));

  return (
    <div className="min-w-[320px] space-y-2 p-2">
      <div className="px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Filters
      </div>
      {filters.length === 0 && (
        <div className="px-1 text-xs text-muted-foreground">No filters applied.</div>
      )}
      {filters.map((f, i) => {
        const opMeta = OPS.find((o) => o.value === f.op);
        return (
          <div key={i} className="flex flex-wrap items-center gap-1.5">
            <Select value={f.propertyId} onValueChange={(v) => update(i, { propertyId: v })}>
              <SelectTrigger className="h-7 w-32 text-xs">
                <SelectValue placeholder="Property" />
              </SelectTrigger>
              <SelectContent>
                {db.properties.map((p) => (
                  <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={f.op} onValueChange={(v) => update(i, { op: v as DatabaseFilter["op"] })}>
              <SelectTrigger className="h-7 w-32 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {OPS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {opMeta?.needsValue && (
              <Input
                value={f.value ?? ""}
                onChange={(e) => update(i, { value: e.target.value })}
                className="h-7 w-28 text-xs"
                placeholder="value"
              />
            )}
            <Button
              variant="ghost"
              size="icon"
              type="button"
              onClick={() => remove(i)}
              className="h-auto w-auto rounded p-1 text-muted-foreground hover:bg-accent"
              aria-label="Remove filter"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        );
      })}
      <Button
        variant="ghost"
        size="sm"
        type="button"
        onClick={addFilter}
        className="mt-1 h-auto gap-1 px-0 text-xs font-normal text-muted-foreground hover:bg-transparent hover:text-foreground"
      >
        <Plus className="h-3 w-3" /> Add filter
      </Button>
    </div>
  );
}
