"use client";

/** ViewOptions — popover with sort + filter + search controls for the
 *  active view. Pure callback — emits the full DatabaseViewConfig
 *  partial on change so caller can dispatch a single update. Inline
 *  search input lives at the top; sort + filter are simple stacked
 *  row builders. */

import { Search, ArrowUpDown, Filter, X } from "lucide-react";
import { cn } from "rahman-shared/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { Database, DatabaseFilter, DatabaseSort, DatabaseViewConfig } from "../types";

const FILTER_OPS: DatabaseFilter["op"][] = [
  "contains", "equals", "not_empty", "is_empty", "checked", "unchecked",
];

export interface ViewOptionsProps {
  db: Database;
  view: DatabaseViewConfig;
  onChange: (patch: Partial<DatabaseViewConfig>) => void;
  className?: string;
}

export function ViewOptions({ db, view, onChange, className }: ViewOptionsProps) {
  const setSearch = (search: string) => onChange({ search });
  const addSort = () => {
    const first = db.properties[0];
    if (!first) return;
    const next: DatabaseSort = { propertyId: first.id, direction: "asc" };
    onChange({ sorts: [...view.sorts, next] });
  };
  const updateSort = (i: number, patch: Partial<DatabaseSort>) => {
    onChange({ sorts: view.sorts.map((s, idx) => (idx === i ? { ...s, ...patch } : s)) });
  };
  const removeSort = (i: number) => onChange({ sorts: view.sorts.filter((_, idx) => idx !== i) });

  const addFilter = () => {
    const first = db.properties[0];
    if (!first) return;
    const next: DatabaseFilter = { propertyId: first.id, op: "contains", value: "" };
    onChange({ filters: [...view.filters, next] });
  };
  const updateFilter = (i: number, patch: Partial<DatabaseFilter>) => {
    onChange({ filters: view.filters.map((f, idx) => (idx === i ? { ...f, ...patch } : f)) });
  };
  const removeFilter = (i: number) => onChange({ filters: view.filters.filter((_, idx) => idx !== i) });

  return (
    <div className={cn("flex items-center gap-1 border-b border-border bg-muted/20 px-2 py-1.5", className)}>
      <div className="relative flex-1">
        <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
        <Input
          value={view.search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search rows…"
          className="h-7 border-0 bg-transparent pl-7 text-xs shadow-none focus-visible:ring-0"
        />
      </div>

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="sm" className="h-7 gap-1 px-2 text-xs text-muted-foreground">
            <ArrowUpDown className="h-3 w-3" /> Sort {view.sorts.length > 0 && <span>· {view.sorts.length}</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-80 p-2">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Sort by</div>
          <div className="mt-1 flex flex-col gap-1">
            {view.sorts.map((s, i) => (
              <div key={i} className="flex items-center gap-1">
                <select value={s.propertyId} onChange={(e) => updateSort(i, { propertyId: e.target.value })} className="h-7 flex-1 rounded-md border border-border bg-background px-2 text-xs">
                  {db.properties.map((p) => (<option key={p.id} value={p.id}>{p.name}</option>))}
                </select>
                <select value={s.direction} onChange={(e) => updateSort(i, { direction: e.target.value as DatabaseSort["direction"] })} className="h-7 rounded-md border border-border bg-background px-2 text-xs">
                  <option value="asc">Asc</option>
                  <option value="desc">Desc</option>
                </select>
                <Button variant="ghost" size="icon" onClick={() => removeSort(i)} className="h-6 w-6 text-muted-foreground"><X className="h-3 w-3" /></Button>
              </div>
            ))}
            <Button variant="ghost" size="sm" onClick={addSort} className="mt-1 h-7 justify-start gap-1 px-2 text-xs text-muted-foreground">+ Add sort</Button>
          </div>
        </PopoverContent>
      </Popover>

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="sm" className="h-7 gap-1 px-2 text-xs text-muted-foreground">
            <Filter className="h-3 w-3" /> Filter {view.filters.length > 0 && <span>· {view.filters.length}</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-96 p-2">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Filter</div>
          <div className="mt-1 flex flex-col gap-1">
            {view.filters.map((f, i) => (
              <div key={i} className="flex items-center gap-1">
                <select value={f.propertyId} onChange={(e) => updateFilter(i, { propertyId: e.target.value })} className="h-7 w-32 rounded-md border border-border bg-background px-2 text-xs">
                  {db.properties.map((p) => (<option key={p.id} value={p.id}>{p.name}</option>))}
                </select>
                <select value={f.op} onChange={(e) => updateFilter(i, { op: e.target.value as DatabaseFilter["op"] })} className="h-7 rounded-md border border-border bg-background px-2 text-xs">
                  {FILTER_OPS.map((op) => (<option key={op} value={op}>{op.replace("_", " ")}</option>))}
                </select>
                <Input value={f.value ?? ""} onChange={(e) => updateFilter(i, { value: e.target.value })} className="h-7 flex-1 text-xs" placeholder="value" />
                <Button variant="ghost" size="icon" onClick={() => removeFilter(i)} className="h-6 w-6 text-muted-foreground"><X className="h-3 w-3" /></Button>
              </div>
            ))}
            <Button variant="ghost" size="sm" onClick={addFilter} className="mt-1 h-7 justify-start gap-1 px-2 text-xs text-muted-foreground">+ Add filter</Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
