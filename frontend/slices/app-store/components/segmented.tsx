"use client";

// Slice-local ui primitive (segmented control) — not part of the shadcn
// registry, so the slice ships its own copy.

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type SegOption<T extends string> = { value: T; label: string };

// Segmented control (os-rr "Seg"). Token-styled, keyboard-clickable buttons.
function Segmented<T extends string>({
  options,
  value,
  onChange,
  className,
}: {
  options: SegOption<T>[];
  value: T;
  onChange: (v: T) => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "inline-flex gap-1 rounded-lg border border-border bg-secondary p-0.5",
        className,
      )}
    >
      {options.map((o) => (
        <Button
          key={o.value}
          type="button"
          variant="ghost"
          onClick={() => onChange(o.value)}
          className={cn(
            "h-auto flex-1 rounded-md px-2.5 py-1 text-xs font-semibold transition-colors hover:bg-transparent",
            value === o.value
              ? "bg-primary text-primary-foreground shadow-sm hover:bg-primary"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {o.label}
        </Button>
      ))}
    </div>
  );
}

export { Segmented };
