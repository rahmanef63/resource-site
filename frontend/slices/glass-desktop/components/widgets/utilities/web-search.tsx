"use client";
// glass-desktop — web-search (utilities, WP wide pill). A shadcn Input "Search
// web…"; submitting fires a sonner toast making clear this is a demo surface
// with no network. Content only — the canvas supplies the glass shell.
import { useState } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { webSearchSeed } from "@/features/glass-desktop/lib/seeds/utilities-2.seed";
import type { WidgetProps } from "@/features/glass-desktop/types";
import { cn } from "@/lib/utils";

export function WebSearch(_props: WidgetProps) {
  const [query, setQuery] = useState("");

  const submit = () => {
    toast(webSearchSeed.toast);
    setQuery("");
  };

  return (
    <form
      className="flex h-full w-full items-center"
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
    >
      <Input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={webSearchSeed.placeholder}
        aria-label={webSearchSeed.placeholder}
        className={cn(
          "h-9 w-full rounded-[var(--radius-control)] border-0 text-xs",
          "[background:var(--color-glass-lo)] [color:var(--color-ink-hi)]",
          "placeholder:[color:var(--color-ink-low)]",
        )}
      />
    </form>
  );
}
