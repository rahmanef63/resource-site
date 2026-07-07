"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { SnapLayoutsMenu } from "./snap-layouts";
import type { WinId } from "../lib/types";

// Windows 11 caption buttons (minimize / maximize-restore / close). Hovering
// the maximize button reveals the Snap Layouts flyout; clicking still maximizes.
// Split out of window.tsx (200 LOC gate) — Windows-only chrome, unrelated to
// the macOS traffic-lights/Full-Screen work living in that file.
export function WinCaption({ id, maximized, focused, onMinimize, onMaximize, onClose }: {
  id: WinId; maximized: boolean; focused: boolean; onMinimize: () => void; onMaximize: () => void; onClose: () => void;
}) {
  const [snapOpen, setSnapOpen] = useState(false);
  return (
    <div className="flex h-full items-stretch">
      <CapBtn onClick={onMinimize} label="Minimize" focused={focused}>
        <rect x="1" y="5" width="8" height="1" />
      </CapBtn>
      <div
        className="relative flex"
        onMouseEnter={() => setSnapOpen(true)}
        onMouseLeave={() => setSnapOpen(false)}
      >
        <CapBtn onClick={onMaximize} label={maximized ? "Restore" : "Maximize"} focused={focused}>
          {maximized ? (
            <>
              <rect x="1" y="2.5" width="6" height="6" fill="none" stroke="currentColor" strokeWidth="1" />
              <rect x="3" y="1" width="6" height="6" fill="none" stroke="currentColor" strokeWidth="1" />
            </>
          ) : (
            <rect x="1" y="1" width="8" height="8" fill="none" stroke="currentColor" strokeWidth="1" />
          )}
        </CapBtn>
        {/* ponytail: instant open on hover (skips Win11's ~400ms hover-intent delay). */}
        {snapOpen && <SnapLayoutsMenu id={id} onClose={() => setSnapOpen(false)} />}
      </div>
      <CapBtn onClick={onClose} label="Close" danger focused={focused}>
        <path d="M1 1l8 8M9 1l-8 8" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
      </CapBtn>
    </div>
  );
}

function CapBtn({ onClick, label, danger, focused, children }: {
  onClick: () => void; label: string; danger?: boolean; focused: boolean; children: React.ReactNode;
}) {
  return (
    <button
      aria-label={label}
      onPointerDown={(e) => e.stopPropagation()}
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      className={cn(
        "grid w-[46px] place-items-center transition-colors",
        // Inactive windows dim caption glyphs together with the title
        // (window.tsx) — the close hover/press red stays exact either way.
        focused ? "text-foreground/90" : "text-muted-foreground/60",
        // Fluent close hover is the exact Win11 red (vars in globals.css)
        danger ? "hover:bg-[var(--win-close-hover)] hover:text-white active:bg-[var(--win-close-active)]" : "hover:bg-muted",
      )}
    >
      <svg viewBox="0 0 10 10" className="size-2.5" fill="currentColor">{children}</svg>
    </button>
  );
}
