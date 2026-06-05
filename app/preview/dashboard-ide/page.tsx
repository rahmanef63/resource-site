"use client";

import * as React from "react";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { FileCode2, Play, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { THEMES, type ThemeId } from "./mock-data";
import {
  ActivityBar, ExplorerSidebar, EditorContent, BottomPanel, StatusBar,
} from "./parts";

export default function DashboardIDEPreview() {
  return (
    <Suspense fallback={null}>
      <Inner />
    </Suspense>
  );
}

function Inner() {
  const p = useSearchParams();
  const themeId = (p.get("theme") ?? "dark") as ThemeId;
  const panels = p.get("panels") ?? "bottom";
  const breadcrumb = p.get("breadcrumb") !== "0";
  const statusBar = p.get("statusBar") === "1";
  const problemsTab = p.get("problemsTab") !== "0";
  const runBtn = p.get("runBtn") !== "0";
  const minimap = p.get("minimap") === "1";
  const t = THEMES[themeId];
  const showBottom = panels === "bottom" || panels === "both";
  const showRight = panels === "right" || panels === "both";

  // Tabs hold PATHS only — file bodies live in the editor and are dropped on
  // tab switch/close (see EditorContent). Explorer click opens/focuses a tab.
  const [tabs, setTabs] = React.useState<string[]>([]);
  const [active, setActive] = React.useState<string | null>(null);

  const open = (path: string) => {
    setTabs((tt) => (tt.includes(path) ? tt : [...tt, path]));
    setActive(path);
  };
  const close = (path: string) => {
    setTabs((tt) => {
      const next = tt.filter((x) => x !== path);
      if (active === path) setActive(next[next.length - 1] ?? null);
      return next;
    });
  };

  const gridRows = showBottom && statusBar ? "grid-rows-[34px_1fr_180px_22px]"
    : showBottom ? "grid-rows-[34px_1fr_180px]"
    : statusBar ? "grid-rows-[34px_1fr_22px]"
    : "grid-rows-[34px_1fr]";

  return (
    <div className={cn("grid h-screen w-full grid-cols-[44px_220px_1fr]", gridRows, t.bg)}>
      <ActivityBar t={t} />

      {/* tabs */}
      <div className="col-start-2 col-end-4 flex items-center overflow-x-auto border-b border-zinc-800 bg-zinc-900/60">
        {tabs.map((tab) => (
          <Button
            type="button"
            variant="ghost"
            key={tab}
            onClick={() => setActive(tab)}
            className={cn(
              "group flex h-full shrink-0 items-center gap-2 rounded-none border-r border-zinc-800 px-3 text-xs font-normal hover:bg-transparent",
              active === tab ? "bg-zinc-950 text-zinc-100 hover:bg-zinc-950 hover:text-zinc-100" : "text-zinc-500 hover:text-zinc-300",
            )}
          >
            <FileCode2 className="size-3 text-sky-400" /> {tab.split("/").pop()}
            <span
              role="button"
              onClick={(e) => {
                e.stopPropagation();
                close(tab);
              }}
              className="ml-1 rounded p-0.5 text-zinc-600 opacity-0 hover:bg-zinc-800 hover:text-zinc-200 group-hover:opacity-100"
            >
              <X className="size-3" />
            </span>
          </Button>
        ))}
        <div className="ml-auto flex items-center gap-2 px-3">
          {runBtn && (
            <Button type="button" variant="ghost" className="flex h-6 items-center gap-1 rounded bg-emerald-500/20 px-2 text-[10px] font-medium text-emerald-300 hover:bg-emerald-500/30 hover:text-emerald-300">
              <Play className="size-3" /> Run
            </Button>
          )}
        </div>
      </div>

      <ExplorerSidebar active={active} onOpen={open} />

      <main className={cn("row-start-2 row-end-3 col-start-3 grid overflow-hidden", showRight ? "grid-cols-[1fr_280px]" : "grid-cols-1")}>
        <div className={cn("relative overflow-auto p-4 font-mono text-[12px] leading-relaxed", t.editor)}>
          <EditorContent path={active} minimap={minimap} breadcrumb={breadcrumb} />
        </div>
        {showRight && (
          <aside className={cn("border-l p-3 text-xs", t.border)}>
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider opacity-60">Inspector</p>
            <p className="opacity-70">Right panel — properties, references, AI assist.</p>
          </aside>
        )}
      </main>

      {showBottom && <BottomPanel t={t} problemsTab={problemsTab} />}
      {statusBar && <StatusBar t={t} path={active} />}
    </div>
  );
}
