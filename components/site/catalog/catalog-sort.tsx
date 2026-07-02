"use client";

import { ArrowUpDown } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { CatalogSearchItem } from "./catalog-search";

export type SortMode = "featured" | "updated" | "name";

export const SORT_OPTIONS: { value: SortMode; label: string }[] = [
  { value: "featured", label: "Featured" },
  { value: "updated", label: "Recently updated" },
  { value: "name", label: "Name (A–Z)" },
];

/** Pure sort of already-filtered items by mode. "featured" = source order. */
export function sortItems(list: CatalogSearchItem[], mode: SortMode): CatalogSearchItem[] {
  if (mode === "featured") return list;
  const arr = [...list];
  if (mode === "name")
    arr.sort((a, b) => (a.sort?.title ?? "").localeCompare(b.sort?.title ?? ""));
  else if (mode === "updated")
    arr.sort((a, b) => (b.sort?.updatedAt ?? 0) - (a.sort?.updatedAt ?? 0));
  return arr;
}

/** Sort dropdown (shadcn Select). Mounted only when items carry sort keys. */
export function SortSelect({
  value,
  onChange,
}: {
  value: SortMode;
  onChange: (v: SortMode) => void;
}) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v as SortMode)}>
      <SelectTrigger aria-label="Sort" className="h-9 w-[168px] gap-1.5 text-sm">
        <ArrowUpDown className="size-3.5 shrink-0 text-muted-foreground" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent align="end">
        {SORT_OPTIONS.map((o) => (
          <SelectItem key={o.value} value={o.value} className="text-sm">
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
