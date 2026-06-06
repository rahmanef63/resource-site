"use client";
/** Variant preview (VP wave) — rr-internal, stripped on `rr add`. */

import { FileText, Folder, Inbox, Search, Settings } from "lucide-react";
import type { SlicePreviewModule } from "@/shared/preview/types";
import { cn } from "@/lib/utils";
import { AppFrame } from "./primitives/app-frame";

const NAV = [
  { icon: Inbox, label: "Inbox" },
  { icon: FileText, label: "Documents" },
  { icon: Folder, label: "Projects" },
  { icon: Settings, label: "Settings" },
];
const ITEMS = ["Quarterly report.pdf", "Design tokens.fig", "budget.csv", "Notes.md"];

function Rail() {
  return (
    <aside className="flex w-44 shrink-0 flex-col gap-1 border-r border-border bg-sidebar p-2">
      {NAV.map((n) => (
        <div key={n.label} className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent">
          <n.icon className="h-4 w-4 text-muted-foreground" />
          <span>{n.label}</span>
        </div>
      ))}
    </aside>
  );
}

function Content() {
  return (
    <div className="flex-1 space-y-1.5 p-3">
      {ITEMS.map((it) => (
        <div key={it} className="rounded-md border border-border bg-background px-3 py-2 text-sm">
          {it}
        </div>
      ))}
    </div>
  );
}

const AppShellPreview: SlicePreviewModule["AppFrame"] = ({ variant }) => {
  const scenario = variant.scenario ?? "sidebar-collapsed";
  const showRail = scenario === "sidebar-expanded";
  const withTopbar = scenario === "with-topbar";

  return (
    <div className="p-4">
      <div className={cn("h-[360px] overflow-hidden rounded-lg border border-border bg-card")}>
        <AppFrame
          safeArea={false}
          header={
            withTopbar ? (
              <div className="flex items-center justify-between px-3 py-2 text-sm font-medium">
                <span>Files</span>
                <Search className="h-4 w-4 text-muted-foreground" />
              </div>
            ) : undefined
          }
          toolbar={
            withTopbar ? (
              <div className="flex items-center gap-2 px-3 py-1.5 text-xs text-muted-foreground">
                <span className="rounded bg-muted px-1.5 py-0.5">All</span>
                <span>Recent</span>
                <span>Shared</span>
              </div>
            ) : undefined
          }
        >
          <div className="flex h-full">
            {(showRail || withTopbar) && <Rail />}
            <Content />
          </div>
        </AppFrame>
      </div>
      <p className="mt-3 text-[11px] text-muted-foreground">
        Scaled shell chrome (AppFrame primitive) — the full AppShell window manager
        targets a real viewport.
      </p>
    </div>
  );
};

const preview: SlicePreviewModule = { AppFrame: AppShellPreview };
export default preview;
