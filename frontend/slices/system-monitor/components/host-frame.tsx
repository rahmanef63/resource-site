"use client";

// Slice-local AppFrame shim (appshell-compatible subset): a @container
// column so children can reflow off pane width. Swap for the shell's
// AppFrame when hosted inside appshell.

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function AppFrame({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("@container flex h-full min-h-0 flex-col", className)}>{children}</div>;
}
