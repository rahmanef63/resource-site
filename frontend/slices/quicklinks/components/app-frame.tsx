"use client";

// Slice-local shim for the appshell AppFrame primitive: a @container scroll
// column so the tile grid reflows off pane width, not viewport width. Lifting
// into a shell: swap this file for the shell's own AppFrame export.

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function AppFrame({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("@container flex h-full min-h-0 flex-col overflow-y-auto", className)}>
      {children}
    </div>
  );
}
