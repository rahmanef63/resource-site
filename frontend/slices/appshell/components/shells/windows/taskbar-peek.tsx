"use client";
import { cn } from "@/lib/utils";
import { AppIcon } from "../../app-icon";
import type { AppDescriptor } from "../../../lib/types";

// Win11 taskbar peek — one acrylic thumbnail card per open window (144px wide,
// 8px radius, icon + title header, thumbnail band below). A web OS can't cheaply
// rasterize a live window, so the app gradient + centered icon is the honest,
// cheap stand-in for a real DOM screenshot (ponytail: no screenshot pipeline).
// Non-interactive (pointer-events-none) so the hover gap above the button can't
// trap the cursor. WHEN this renders (the ~400ms hover-intent gate) lives in
// taskbar-buttons.tsx (useHoverIntent) — this component is presentation-only.
export function TaskbarPeek({ app, titles }: { app?: AppDescriptor; titles: string[] }) {
  if (titles.length === 0) return null;
  return (
    <div className="pointer-events-none absolute bottom-full left-1/2 z-[70] mb-2 flex -translate-x-1/2 gap-2">
      {titles.map((title, i) => (
        <div
          key={i}
          className={cn("material-menu", "w-36 overflow-hidden rounded-[8px] border border-border/60 text-left shadow-lg")}
        >
          <div className="flex h-7 items-center gap-1.5 border-b border-border/60 px-2">
            {app && <span className="size-4 shrink-0"><AppIcon app={app} /></span>}
            <span className="truncate text-[12px] font-medium">{title}</span>
          </div>
          <div className="grid aspect-video place-items-center" style={{ background: app?.gradient ?? "var(--muted)" }}>
            {app && <span className="size-10 opacity-90"><AppIcon app={app} /></span>}
          </div>
        </div>
      ))}
    </div>
  );
}
