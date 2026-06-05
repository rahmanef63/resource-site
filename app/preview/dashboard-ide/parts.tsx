"use client";

import * as React from "react";
import {
  FileCode2, Search, GitBranch, Bug, Settings, ChevronRight,
  Terminal, AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { readFile, type ThemeId, THEMES } from "./mock-data";

export { ExplorerSidebar } from "./explorer";

export function ActivityBar({ t }: { t: typeof THEMES[ThemeId] }) {
  return (
    <aside className={cn("row-span-full flex flex-col items-center gap-1 border-r py-2", t.border, t.panel)}>
      {[FileCode2, Search, GitBranch, Bug, Settings].map((Icon, i) => (
        <Button
          type="button"
          variant="ghost"
          key={i}
          className={cn(
            "flex size-9 items-center justify-center rounded text-zinc-400 transition-colors hover:bg-transparent hover:text-zinc-100",
            i === 0 && "border-l-2 border-violet-400 text-zinc-100",
          )}
        >
          <Icon className="size-4" />
        </Button>
      ))}
    </aside>
  );
}

// Crude single-purpose highlighter — enough to read like an editor without
// shipping a real tokenizer into a layout preview.
function tint(line: string): React.ReactNode {
  if (/^(import|export)/.test(line)) return <span className="text-violet-400">{line}</span>;
  if (/^\s*(return|const|let)/.test(line)) return <span className="text-sky-300">{line}</span>;
  if (/^\s*</.test(line) || /[{}]\s*$/.test(line)) return <span className="text-zinc-500">{line}</span>;
  if (/^\s*"/.test(line)) return <span className="text-emerald-300">{line}</span>;
  return <span>{line}</span>;
}

export function EditorContent({ path, minimap, breadcrumb }: { path: string | null; minimap: boolean; breadcrumb: boolean }) {
  const [lines, setLines] = React.useState<string[] | null>(null);

  // Body is fetched when the tab becomes active and replaced on switch — the
  // editor holds ONE file's content, not every opened file's.
  React.useEffect(() => {
    setLines(null);
    if (!path) return;
    let on = true;
    void readFile(path).then((l) => on && setLines(l));
    return () => {
      on = false;
    };
  }, [path]);

  if (!path) {
    return <p className="mt-10 text-center text-xs text-zinc-600">Open a file from the Explorer</p>;
  }

  return (
    <>
      {breadcrumb && (
        <div className="mb-2 flex items-center gap-1 text-[11px] text-muted-foreground">
          {path.split("/").map((seg, i, all) => (
            <React.Fragment key={i}>
              {i > 0 && <ChevronRight className="size-3" />}
              <span className={cn(i === all.length - 1 && "text-zinc-300")}>{seg}</span>
            </React.Fragment>
          ))}
        </div>
      )}
      {minimap && (
        <div className="absolute right-1 top-1 h-32 w-12 rounded border border-dashed border-current/20 bg-current/5 p-1 text-[6px] leading-tight opacity-50">
          {Array.from({ length: 12 }).map((_, i) => <div key={i} className="mb-0.5 h-1 rounded-sm bg-current/30" style={{ width: `${30 + ((i * 17) % 60)}%` }} />)}
        </div>
      )}
      <pre>
        {(lines ?? ["// loading…"]).map((l, i) => (
          <div key={i} className="flex gap-4">
            <span className="w-6 select-none text-right text-zinc-600">{i + 1}</span>
            {tint(l)}
          </div>
        ))}
      </pre>
    </>
  );
}

export function BottomPanel({ t, problemsTab }: { t: typeof THEMES[ThemeId]; problemsTab: boolean }) {
  return (
    <section className={cn("col-start-2 col-end-4 row-start-3 row-end-4 grid grid-rows-[28px_1fr] border-t", t.border, t.panel)}>
      <div className={cn("flex items-center gap-3 border-b px-3 text-[11px] opacity-80", t.border)}>
        <span className="flex items-center gap-1.5 border-b-2 border-violet-400 py-1.5">
          <Terminal className="size-3" /> Terminal
        </span>
        {problemsTab && (
          <span className="flex items-center gap-1.5 py-1.5">
            <AlertCircle className="size-3" /> Problems <span className="rounded bg-red-500/20 px-1 text-[9px] text-red-300">2</span>
          </span>
        )}
      </div>
      <div className="overflow-auto bg-[#0a0a0d] p-3 font-mono text-[11px] text-zinc-400">
        <p><span className="text-emerald-400">$</span> pnpm dev</p>
        <p><span className="text-zinc-500">▲ Next.js 16.0.0  (turbopack)</span></p>
        <p>  - Local:        <span className="text-sky-400">http://localhost:3000</span></p>
        <p>  - Network:      <span className="text-sky-400">http://192.168.1.4:3000</span></p>
        <p className="mt-1"><span className="text-emerald-400">✓</span> Ready in 312 ms</p>
      </div>
    </section>
  );
}

export function StatusBar({ t, path }: { t: typeof THEMES[ThemeId]; path: string | null }) {
  const lang = !path ? "—" : path.endsWith(".json") ? "JSON" : path.endsWith(".css") ? "CSS" : "TypeScript React";
  return (
    <footer className={cn("col-start-2 col-end-4 flex items-center justify-between border-t px-3 text-[10px] opacity-80", t.border)}>
      <div className="flex items-center gap-3"><span className="flex items-center gap-1"><GitBranch className="size-2.5" /> main</span><span>UTF-8</span><span>{lang}</span></div>
      <div className="flex items-center gap-3"><span>Ln 7, Col 3</span><span>Spaces: 2</span></div>
    </footer>
  );
}
