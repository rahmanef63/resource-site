"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

// Slice-local copy of the appshell `AppFrame` primitive so the slice stays
// self-contained (no shell peer). Standard app scaffold: optional header/
// toolbar/footer rows + a scrolling body that honours safe-area insets. The
// whole frame is a CSS `@container`, so children reflow off the PANE width
// (works the same in a 380px window and a fullscreen phone) — pair with
// @sm/@md/@lg or @max-[…] variants. Lifting into a shell (e.g. `appshell`):
// swap imports to the shell's own AppFrame — the props are identical.
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
          // `--sai-bottom` is shell-provided; falls back to 0 standalone.
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
