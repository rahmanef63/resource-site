import * as React from "react";
import type { LucideIcon } from "lucide-react";

export function MarketingMock() {
  return (
    <div className="absolute inset-0 flex flex-col gap-1.5 p-3">
      {/* Top nav */}
      <div className="flex items-center gap-1">
        <div className="size-1.5 rounded-full bg-foreground/30" />
        <div className="ml-2 h-1.5 w-12 rounded bg-foreground/20" />
        <div className="ml-auto flex gap-1">
          <div className="h-1.5 w-6 rounded bg-foreground/15" />
          <div className="h-1.5 w-6 rounded bg-foreground/15" />
          <div className="h-1.5 w-8 rounded bg-foreground/30" />
        </div>
      </div>
      {/* Hero */}
      <div className="mt-3 flex flex-col items-center gap-1.5">
        <div className="h-2 w-3/4 rounded bg-foreground/40" />
        <div className="h-2 w-1/2 rounded bg-foreground/30" />
        <div className="mt-1 h-1.5 w-1/3 rounded bg-foreground/20" />
        <div className="mt-2 flex gap-1.5">
          <div className="h-2.5 w-10 rounded bg-foreground/40" />
          <div className="h-2.5 w-8 rounded bg-foreground/15" />
        </div>
      </div>
      {/* 3-col strip */}
      <div className="mt-auto grid grid-cols-3 gap-1">
        <div className="h-6 rounded bg-foreground/10" />
        <div className="h-6 rounded bg-foreground/10" />
        <div className="h-6 rounded bg-foreground/10" />
      </div>
    </div>
  );
}

export function DashboardMock() {
  return (
    <div className="absolute inset-0 flex">
      {/* Sidebar */}
      <div className="flex w-1/5 flex-col gap-1 border-r border-foreground/10 bg-foreground/5 p-2">
        <div className="h-1.5 w-full rounded bg-foreground/30" />
        <div className="mt-2 h-1.5 w-full rounded bg-foreground/15" />
        <div className="h-1.5 w-3/4 rounded bg-foreground/15" />
        <div className="h-1.5 w-full rounded bg-foreground/15" />
        <div className="h-1.5 w-2/3 rounded bg-foreground/15" />
      </div>
      {/* Main */}
      <div className="flex flex-1 flex-col gap-1.5 p-2">
        <div className="flex items-center justify-between">
          <div className="h-1.5 w-12 rounded bg-foreground/30" />
          <div className="size-2 rounded-full bg-foreground/30" />
        </div>
        <div className="grid grid-cols-3 gap-1">
          <div className="h-5 rounded bg-foreground/15" />
          <div className="h-5 rounded bg-foreground/15" />
          <div className="h-5 rounded bg-foreground/15" />
        </div>
        <div className="mt-1 flex-1 rounded bg-foreground/10" />
      </div>
    </div>
  );
}

export function CmsMock() {
  return (
    <div className="absolute inset-0 flex">
      {/* List pane */}
      <div className="flex w-2/5 flex-col gap-1 border-r border-foreground/10 p-2">
        <div className="h-1.5 w-3/4 rounded bg-foreground/30" />
        <div className="mt-1 h-2 rounded bg-foreground/15" />
        <div className="h-2 rounded bg-foreground/20" />
        <div className="h-2 rounded bg-foreground/15" />
        <div className="h-2 rounded bg-foreground/15" />
        <div className="h-2 rounded bg-foreground/15" />
      </div>
      {/* Edit pane */}
      <div className="flex flex-1 flex-col gap-1.5 p-2">
        <div className="h-2 w-1/2 rounded bg-foreground/40" />
        <div className="h-1.5 w-1/3 rounded bg-foreground/20" />
        <div className="mt-1 h-1.5 rounded bg-foreground/15" />
        <div className="h-1.5 rounded bg-foreground/15" />
        <div className="h-1.5 w-3/4 rounded bg-foreground/15" />
        <div className="mt-auto flex gap-1.5">
          <div className="h-2.5 w-10 rounded bg-foreground/40" />
          <div className="h-2.5 w-8 rounded bg-foreground/15" />
        </div>
      </div>
    </div>
  );
}

export function SliceMock({
  Icon,
  label,
  accents,
}: {
  Icon: LucideIcon;
  label?: string;
  accents?: string[];
}) {
  return (
    <div className="absolute inset-0 flex flex-col">
      <div className="flex flex-1 items-center justify-center">
        <div className="rounded-full bg-background/60 p-3 ring-1 ring-border/40 backdrop-blur-sm">
          <Icon className="size-6 text-foreground/70" />
        </div>
      </div>
      {/* Accent chips bottom strip */}
      {(accents?.length ?? 0) > 0 && (
        <div className="flex flex-wrap items-end gap-1 p-2">
          {accents!.slice(0, 4).map((a) => (
            <span
              key={a}
              className="rounded-full bg-background/70 px-1.5 py-0.5 text-[9px] font-medium text-foreground/70 ring-1 ring-border/30 backdrop-blur-sm"
            >
              {a}
            </span>
          ))}
        </div>
      )}
      {label && !accents?.length && (
        <p className="p-2 text-center text-[10px] uppercase tracking-wider text-foreground/50">
          {label}
        </p>
      )}
    </div>
  );
}

export function RecipeMock({ Icon, label }: { Icon: LucideIcon; label?: string }) {
  return (
    <div className="absolute inset-0 flex flex-col">
      <div className="flex flex-1 items-center justify-center">
        <div className="rounded-md bg-background/60 p-3 ring-1 ring-border/40 backdrop-blur-sm">
          <Icon className="size-6 text-foreground/70" />
        </div>
      </div>
      {/* Code-line accents */}
      <div className="flex flex-col gap-0.5 p-2">
        <div className="h-1 w-3/4 rounded bg-foreground/15" />
        <div className="h-1 w-1/2 rounded bg-foreground/10" />
        <div className="h-1 w-2/3 rounded bg-foreground/10" />
      </div>
      {label && (
        <p className="px-2 pb-2 text-center text-[10px] uppercase tracking-wider text-foreground/50">
          {label}
        </p>
      )}
    </div>
  );
}
