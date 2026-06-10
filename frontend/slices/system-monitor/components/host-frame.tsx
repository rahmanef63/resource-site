"use client";

// Slice-local shims for the appshell primitives this slice uses (AppFrame +
// TouchList), kept appshell-compatible so the slice can lift into the shell
// by swapping this file for the shell's exports.

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

// A @container column so children can reflow off pane width.
export function AppFrame({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("@container flex h-full min-h-0 flex-col", className)}>{children}</div>;
}

// A list whose rows grow to ≥44px hit targets on coarse pointers (touch) and
// stay compact with a mouse. The shell version reads its ResponsiveProvider;
// this shim gets the same result from a pure CSS pointer media query.
export function TouchList({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      role="list"
      className={cn("flex flex-col", "[@media(pointer:coarse)]:[&>*]:min-h-11", className)}
    >
      {children}
    </div>
  );
}
