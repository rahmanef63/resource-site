"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useIsMobile } from "./host";

// Right property rail (desktop) / right sheet (mobile). Standalone stand-in
// for the appshell `AppInspector` with the same prop shape, so swapping the
// host seam back onto a shell is a re-export change only.
export function AppInspector({
  open,
  onOpenChange,
  railOpen = true,
  title = "Details",
  railClassName,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  railOpen?: boolean;
  title?: string;
  railClassName?: string;
  children: React.ReactNode;
}) {
  const isMobile = useIsMobile();

  if (!isMobile) {
    if (!railOpen) return null;
    return (
      <aside className={cn("flex w-64 shrink-0 flex-col overflow-hidden border-l border-border bg-card/30", railClassName)}>
        {children}
      </aside>
    );
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-80 flex-col gap-0 p-0 sm:max-w-sm">
        <SheetHeader className="border-b border-border px-4 py-3">
          <SheetTitle className="text-sm">{title}</SheetTitle>
        </SheetHeader>
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">{children}</div>
      </SheetContent>
    </Sheet>
  );
}
