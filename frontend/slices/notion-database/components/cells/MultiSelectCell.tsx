"use client";

/** MultiSelectCell — Notion-style popover multi-select.
 *  Trigger shows selected chips; popover hosts search + option list +
 *  per-option rename/color/delete menu + inline "Create new" creator.
 *  Props-driven: `onOptionsChange` enables full schema edits (additive). */

import { useMemo, useState } from "react";
import { Check, Edit2, MoreHorizontal, Plus, Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { SelectOption } from "../../types";

const OPTION_COLORS = [
  { id: "default", label: "Default", className: "bg-muted text-foreground" },
  { id: "gray",    label: "Gray",    className: "bg-gray-200 text-gray-800 dark:bg-gray-800 dark:text-gray-100" },
  { id: "brown",   label: "Brown",   className: "bg-amber-200 text-amber-900 dark:bg-amber-900 dark:text-amber-100" },
  { id: "orange",  label: "Orange",  className: "bg-orange-200 text-orange-900 dark:bg-orange-900 dark:text-orange-100" },
  { id: "yellow",  label: "Yellow",  className: "bg-yellow-200 text-yellow-900 dark:bg-yellow-900 dark:text-yellow-100" },
  { id: "green",   label: "Green",   className: "bg-green-200 text-green-900 dark:bg-green-900 dark:text-green-100" },
  { id: "blue",    label: "Blue",    className: "bg-blue-200 text-blue-900 dark:bg-blue-900 dark:text-blue-100" },
  { id: "purple",  label: "Purple",  className: "bg-purple-200 text-purple-900 dark:bg-purple-900 dark:text-purple-100" },
  { id: "pink",    label: "Pink",    className: "bg-pink-200 text-pink-900 dark:bg-pink-900 dark:text-pink-100" },
  { id: "red",     label: "Red",     className: "bg-red-200 text-red-900 dark:bg-red-900 dark:text-red-100" },
];

function colorClass(color?: string): string {
  return OPTION_COLORS.find((c) => c.id === color)?.className ?? OPTION_COLORS[0].className;
}

interface MultiSelectCellProps {
  options: SelectOption[];
  value: string[];
  readOnly?: boolean;
  onChange?: (next: string[]) => void;
  onOptionsChange?: (nextOptions: SelectOption[]) => void;
}

function Chip({ opt, onRemove }: { opt: SelectOption; onRemove?: () => void }) {
  return (
    <span className={cn("inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-xs", colorClass(opt.color))}>
      {opt.name}
      {onRemove && (
        <button type="button" onClick={(e) => { e.stopPropagation(); onRemove(); }} className="opacity-60 hover:opacity-100">
          <X className="h-3 w-3" />
        </button>
      )}
    </span>
  );
}

export function MultiSelectCell({ options, value, readOnly, onChange, onOptionsChange }: MultiSelectCellProps) {
  const ids = Array.isArray(value) ? value : [];
  const selected = ids.map((id) => options.find((o) => o.id === id)).filter(Boolean) as SelectOption[];
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return q ? options.filter((o) => o.name.toLowerCase().includes(q)) : options;
  }, [options, search]);

  const exactMatch = options.some((o) => o.name.toLowerCase() === search.trim().toLowerCase());
  const canCreate = !!onOptionsChange && search.trim().length > 0 && !exactMatch;

  if (readOnly) {
    return <div className="flex flex-wrap gap-1">{selected.map((o) => <Chip key={o.id} opt={o} />)}</div>;
  }

  const toggle = (id: string) => onChange?.(ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]);
  const remove = (id: string) => onChange?.(ids.filter((x) => x !== id));

  const createOption = () => {
    if (!canCreate || !onOptionsChange) return;
    const next: SelectOption = { id: crypto.randomUUID(), name: search.trim(), color: "default" };
    onOptionsChange([...options, next]);
    onChange?.([...ids, next.id]);
    setSearch("");
  };

  const renameOption = (id: string) => {
    if (!onOptionsChange) return;
    const cur = options.find((o) => o.id === id);
    const name = window.prompt("Rename option", cur?.name ?? "")?.trim();
    if (!name) return;
    onOptionsChange(options.map((o) => (o.id === id ? { ...o, name } : o)));
  };
  const setColor = (id: string, color: string) => onOptionsChange?.(options.map((o) => (o.id === id ? { ...o, color } : o)));
  const deleteOption = (id: string) => {
    if (!onOptionsChange) return;
    onOptionsChange(options.filter((o) => o.id !== id));
    if (ids.includes(id)) onChange?.(ids.filter((x) => x !== id));
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button type="button" className="flex min-h-7 w-full flex-wrap items-center gap-1 rounded-md border border-border bg-background px-2 py-1 text-left text-sm hover:bg-accent">
          {selected.length === 0
            ? <span className="text-muted-foreground/60">—</span>
            : selected.map((o) => <Chip key={o.id} opt={o} />)}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-0" align="start">
        <div className="flex flex-wrap items-center gap-1 border-b border-border p-2">
          {selected.map((o) => <Chip key={o.id} opt={o} onRemove={() => remove(o.id)} />)}
          <Input
            autoFocus value={search} onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && canCreate) { e.preventDefault(); createOption(); } }}
            placeholder={selected.length ? "" : "Search or create..."}
            className="h-6 flex-1 min-w-[6rem] border-0 bg-transparent p-0 text-sm shadow-none focus-visible:ring-0"
          />
        </div>
        <div className="max-h-64 overflow-y-auto p-1">
          <div className="px-2 py-1 text-[10px] uppercase tracking-wide text-muted-foreground">Select an option or create one</div>
          {filtered.map((o) => {
            const active = ids.includes(o.id);
            return (
              <div key={o.id} className="group flex items-center gap-1 rounded px-1 py-0.5 hover:bg-accent">
                <button type="button" onClick={() => toggle(o.id)} className="flex flex-1 items-center gap-2 py-1 text-left">
                  <Check className={cn("h-3 w-3 shrink-0", active ? "text-primary" : "opacity-0")} />
                  <Chip opt={o} />
                </button>
                {onOptionsChange && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100" onClick={(e) => e.stopPropagation()}>
                        <MoreHorizontal className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-44">
                      <DropdownMenuItem onClick={() => renameOption(o.id)}><Edit2 className="mr-2 h-3 w-3" />Rename</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => deleteOption(o.id)}><Trash2 className="mr-2 h-3 w-3" />Delete</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <div className="px-2 py-1 text-[10px] uppercase tracking-wide text-muted-foreground">Color</div>
                      {OPTION_COLORS.map((c) => (
                        <DropdownMenuItem key={c.id} onClick={() => setColor(o.id, c.id)}>
                          <span className={cn("mr-2 inline-block h-3 w-3 rounded-full border border-border", c.className)} />
                          {c.label}{o.color === c.id && <Check className="ml-auto h-3 w-3" />}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            );
          })}
          {canCreate && (
            <button type="button" onClick={createOption} className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-sm hover:bg-accent">
              <Plus className="h-3 w-3" />
              <span>Create</span>
              <Chip opt={{ id: "__new", name: search.trim(), color: "default" }} />
            </button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
