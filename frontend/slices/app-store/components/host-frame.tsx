"use client";

// Slice-local AppFrame + TouchList shims (appshell-compatible subset). Swap
// for the shell's own primitives when hosted inside appshell.
//
// AppFrame: optional header/toolbar/footer rows + a scrolling body that
// honours safe-area insets (`--sai-bottom`, falls back to 0px standalone).
// The frame is a CSS `@container` so children reflow off the PANE width —
// pair with @sm/@md/@lg variants or useContainer().
// TouchList: rows grow to ≥44px hit targets on coarse pointers (touch).

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { usePointerCoarse } from "../lib/use-container";

export function AppFrame({
  header,
  toolbar,
  footer,
  children,
  className,
  bodyClassName,
  safeArea = true,
}: {
  header?: ReactNode;
  toolbar?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
  /** Pad the body for notch/home-bar (mobile fullscreen). Default on. */
  safeArea?: boolean;
}) {
  return (
    <div className={cn("@container flex h-full min-h-0 flex-col", className)}>
      {header && (
        <div className="flex-none border-b border-border">{header}</div>
      )}
      {toolbar && (
        <div className="flex-none border-b border-border">{toolbar}</div>
      )}
      <div
        className={cn(
          "min-h-0 flex-1 overflow-auto",
          safeArea && "[padding-bottom:var(--sai-bottom,0px)]",
          bodyClassName,
        )}
      >
        {children}
      </div>
      {footer && (
        <div className="flex-none border-t border-border">{footer}</div>
      )}
    </div>
  );
}

export function TouchList({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const coarse = usePointerCoarse();
  return (
    <div
      role="list"
      className={cn("flex flex-col", coarse && "[&>*]:min-h-11", className)}
    >
      {children}
    </div>
  );
}
