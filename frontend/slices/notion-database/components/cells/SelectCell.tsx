"use client";

/** SelectCell — Notion-style single-pick popover.
 *  Read-only renders chip only. Editable mode opens a popover with
 *  searchable option list, inline rename/recolor/delete, and an
 *  "Add option" row with color picker. Option mutations stream through
 *  `onOptionsChange` (host wires via `onPropertyChange({ options })`). */

import { useMemo, useState } from "react";
import { Check, Edit2, MoreHorizontal, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { SelectOption } from "../../types";

const OPTION_COLORS = [
  "default", "gray", "brown", "orange", "yellow",
  "green", "blue", "purple", "pink", "red",
] as const;
type OptionColor = (typeof OPTION_COLORS)[number];

const COLOR_CLASS: Record<string, string> = {
  default: "bg-muted text-foreground",
  gray: "bg-gray-200 text-gray-800 dark:bg-gray-800 dark:text-gray-100",
  brown: "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-100",
  orange: "bg-orange-100 text-orange-900 dark:bg-orange-950 dark:text-orange-100",
  yellow: "bg-yellow-100 text-yellow-900 dark:bg-yellow-950 dark:text-yellow-100",
  green: "bg-green-100 text-green-900 dark:bg-green-950 dark:text-green-100",
  blue: "bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-100",
  purple: "bg-purple-100 text-purple-900 dark:bg-purple-950 dark:text-purple-100",
  pink: "bg-pink-100 text-pink-900 dark:bg-pink-950 dark:text-pink-100",
  red: "bg-red-100 text-red-900 dark:bg-red-950 dark:text-red-100",
};
const colorClass = (c?: string) => COLOR_CLASS[c ?? "default"] ?? COLOR_CLASS.default;
const newId = () => (typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `opt_${Date.now()}`);

interface SelectCellProps {
  options: SelectOption[];
  value: string | null;
  readOnly?: boolean;
  onChange?: (next: string | null) => void;
  /** Mutate the property's option list (add/rename/recolor/delete). */
  onOptionsChange?: (nextOptions: SelectOption[]) => void;
}

function Chip({ option, className }: { option: SelectOption; className?: string }) {
  return (
    <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium",
      colorClass(option.color), className)}>{option.name}</span>
  );
}

function ColorSwatches({ active, onPick }: { active?: string; onPick: (c: OptionColor) => void }) {
  return (
    <div className="grid grid-cols-5 gap-1 p-2">
      {OPTION_COLORS.map((c) => (
        <button key={c} type="button" onClick={() => onPick(c)} title={c}
          className={cn("h-5 w-5 rounded-full border", colorClass(c),
            active === c ? "border-foreground" : "border-border")} />
      ))}
    </div>
  );
}

export function SelectCell({
  options, value, readOnly, onChange, onOptionsChange,
}: SelectCellProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [draftColor, setDraftColor] = useState<OptionColor>("default");
  const [draftName, setDraftName] = useState("");
  const [renameId, setRenameId] = useState<string | null>(null);
  const [renameDraft, setRenameDraft] = useState("");

  const selected = useMemo(() => options.find((o) => o.id === value) ?? null, [options, value]);
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? options.filter((o) => o.name.toLowerCase().includes(q)) : options;
  }, [options, query]);

  if (readOnly) {
    return selected ? <Chip option={selected} /> : <span className="text-muted-foreground/60">—</span>;
  }

  const canManage = !!onOptionsChange;
  const addOption = () => {
    const name = draftName.trim();
    if (!name || !onOptionsChange) return;
    onOptionsChange([...options, { id: newId(), name, color: draftColor }]);
    setDraftName("");
  };
  const updateOption = (id: string, patch: Partial<SelectOption>) => {
    onOptionsChange?.(options.map((o) => (o.id === id ? { ...o, ...patch } : o)));
  };
  const deleteOption = (id: string) => {
    onOptionsChange?.(options.filter((o) => o.id !== id));
    if (value === id) onChange?.(null);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" className="h-7 w-full justify-start gap-1 rounded px-2 py-0 text-left font-normal hover:bg-accent/50">
          {selected ? <Chip option={selected} /> : <span className="text-muted-foreground">—</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-64 p-2 bg-popover text-popover-foreground">
        <Input autoFocus value={query} onChange={(e) => setQuery(e.target.value)}
          placeholder="Search options…" className="h-7 text-xs" />
        <div className="mt-2 max-h-56 space-y-0.5 overflow-y-auto">
          {filtered.length === 0 && (
            <div className="px-2 py-1 text-xs text-muted-foreground">No options</div>
          )}
          {filtered.map((o) => {
            const isSel = o.id === value;
            const isRenaming = renameId === o.id;
            return (
              <div key={o.id} className="group flex items-center gap-1 rounded px-1 py-0.5 hover:bg-accent">
                <button type="button"
                  onClick={() => { onChange?.(isSel ? null : o.id); setOpen(false); }}
                  className="flex min-w-0 flex-1 items-center gap-1 text-left">
                  {isRenaming ? (
                    <Input autoFocus value={renameDraft}
                      onChange={(e) => setRenameDraft(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      onBlur={() => {
                        const n = renameDraft.trim();
                        if (n) updateOption(o.id, { name: n });
                        setRenameId(null);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") (e.currentTarget as HTMLInputElement).blur();
                        if (e.key === "Escape") setRenameId(null);
                      }}
                      className="h-6 flex-1 text-xs" />
                  ) : <Chip option={o} className="truncate" />}
                  {isSel && !isRenaming && <Check className="ml-auto h-3 w-3 shrink-0" />}
                </button>
                {canManage && !isRenaming && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100">
                        <MoreHorizontal className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                      <DropdownMenuItem onSelect={() => { setRenameDraft(o.name); setRenameId(o.id); }}>
                        <Edit2 className="mr-2 h-3 w-3" /> Rename
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuLabel className="text-[10px]">Color</DropdownMenuLabel>
                      <ColorSwatches active={o.color} onPick={(c) => updateOption(o.id, { color: c })} />
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onSelect={() => deleteOption(o.id)} className="text-destructive">
                        <Trash2 className="mr-2 h-3 w-3" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            );
          })}
        </div>
        {canManage && (
          <div className="mt-2 flex items-center gap-1 border-t border-border pt-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-7 w-7 shrink-0 p-0" title="Color">
                  <span className={cn("inline-block h-3 w-3 rounded-full border border-border", colorClass(draftColor))} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <ColorSwatches active={draftColor} onPick={setDraftColor} />
              </DropdownMenuContent>
            </DropdownMenu>
            <Input value={draftName} onChange={(e) => setDraftName(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addOption(); } }}
              placeholder="Add option…" className="h-7 flex-1 text-xs" />
            <Button variant="ghost" onClick={addOption} className="h-7 w-7 shrink-0 p-0" title="Add">
              <Plus className="h-3 w-3" />
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
