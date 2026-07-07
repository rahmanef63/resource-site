"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

// Standard app scaffold: optional header/toolbar row + a scrolling body that
// honours safe-area insets. The whole frame is a CSS `@container` so children
// can reflow off the PANE width (works the same in a 380px window and a
// fullscreen phone) — pair with @sm/@md/@lg variants or useContainer().
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
  /**
   * Which safe areas to pad the scrolling body for. `true` (default, the
   * original behavior) = bottom only — home-indicator clearance on a phone, a
   * no-op var(--sai-bottom) everywhere else. `"top"` / `"both"` additionally
   * reserve pt-11 (the 44px status-bar row): opt in when the OS chrome floats
   * OVER the app instead of reserving its own header row — today only the
   * mobile fullscreen app layer (mobile-shell.tsx) needs that, now that its
   * OS-imposed header is gone (P2 ios-fullscreen-app-chrome).
   */
  safeArea?: boolean | "top" | "bottom" | "both";
}) {
  const padTop = safeArea === "top" || safeArea === "both";
  const padBottom = safeArea === true || safeArea === "bottom" || safeArea === "both";
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
          padTop && "pt-11",
          padBottom && "[padding-bottom:var(--sai-bottom)]",
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
