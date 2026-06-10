"use client";

// Slice-local segmented control (os-rr "Seg") built on the shadcn Button so
// the slice stays raw-button free. Token-styled, keyboard-clickable.

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export type SegOption<T extends string> = { value: T; label: string };

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
          size="sm"
          onClick={() => onChange(o.value)}
          className={cn(
            "h-7 flex-1 rounded-md px-2.5 text-xs font-semibold",
            o.value === value
              ? "bg-primary text-primary-foreground shadow-sm hover:bg-primary hover:text-primary-foreground"
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
