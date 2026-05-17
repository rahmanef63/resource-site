"use client";

import * as React from "react";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  FileCode2,
  Search,
  GitBranch,
  Bug,
  Settings,
  Play,
  X,
  Folder,
  ChevronRight,
  ChevronDown,
  Terminal,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const THEMES = {
  dark:  { bg: "bg-zinc-950 text-zinc-200", panel: "bg-zinc-900/60", editor: "bg-[#0b0b0e]", border: "border-zinc-800" },
  light: { bg: "bg-zinc-50 text-zinc-900",   panel: "bg-white/80",     editor: "bg-white",     border: "border-zinc-200" },
  sepia: { bg: "bg-[#f5f1e8] text-[#3a2f23]", panel: "bg-[#ede5d3]/80", editor: "bg-[#f5ebd7]",  border: "border-[#d8cba8]" },
};

const FILES = [
  { id: "page.tsx",    label: "app/page.tsx",            kind: "tsx" },
  { id: "layout.tsx",  label: "app/layout.tsx",          kind: "tsx" },
  { id: "config.ts",   label: "frontend/feature/config", kind: "ts"  },
];

const TREE = [
  { name: "app", expanded: true, children: ["page.tsx", "layout.tsx", "globals.css"] },
  { name: "frontend", expanded: true, children: ["feature/", "shared/"] },
  { name: "convex", expanded: false, children: [] },
];

export default function DashboardIDEPreview() {
  return (
    <Suspense fallback={null}>
      <Inner />
    </Suspense>
  );
}

function Inner() {
  const p = useSearchParams();
  const themeId = (p.get("theme") ?? "dark") as keyof typeof THEMES;
  const panels = p.get("panels") ?? "bottom";
  const breadcrumb = p.get("breadcrumb") !== "0";
  const statusBar = p.get("statusBar") === "1";
  const problemsTab = p.get("problemsTab") !== "0";
  const runBtn = p.get("runBtn") !== "0";
  const minimap = p.get("minimap") === "1";
  const t = THEMES[themeId];
  const showBottom = panels === "bottom" || panels === "both";
  const showRight = panels === "right" || panels === "both";

  const [active, setActive] = React.useState("page.tsx");
  const [tabs, setTabs] = React.useState<string[]>(["page.tsx", "layout.tsx"]);

  const gridRows = showBottom && statusBar ? "grid-rows-[34px_1fr_180px_22px]"
    : showBottom ? "grid-rows-[34px_1fr_180px]"
    : statusBar ? "grid-rows-[34px_1fr_22px]"
    : "grid-rows-[34px_1fr]";

  return (
    <div className={cn("grid h-screen w-full grid-cols-[44px_220px_1fr]", gridRows, t.bg)}>
      {/* activity bar */}
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

      {/* tabs */}
      <div className="col-start-2 col-end-4 flex items-center border-b border-zinc-800 bg-zinc-900/60">
        {tabs.map((t) => (
          <Button
            type="button"
            variant="ghost"
            key={t}
            onClick={() => setActive(t)}
            className={cn(
              "group flex h-full items-center gap-2 rounded-none border-r border-zinc-800 px-3 text-xs font-normal hover:bg-transparent",
              active === t ? "bg-zinc-950 text-zinc-100 hover:bg-zinc-950 hover:text-zinc-100" : "text-zinc-500 hover:text-zinc-300",
            )}
          >
            <FileCode2 className="size-3 text-sky-400" /> {t}
            <span
              role="button"
              onClick={(e) => {
                e.stopPropagation();
                setTabs((tt) => tt.filter((x) => x !== t));
                if (active === t) setActive(tabs[0]);
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

      {/* sidebar tree */}
      <aside className="row-start-2 row-end-4 border-r border-zinc-800 bg-zinc-900/30 p-2 text-xs">
        <p className="mb-2 px-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
          Explorer
        </p>
        {TREE.map((node) => (
          <Tree key={node.name} node={node} />
        ))}
      </aside>

      {/* editor area */}
      <main className={cn("row-start-2 row-end-3 col-start-3 grid overflow-hidden", showRight ? "grid-cols-[1fr_280px]" : "grid-cols-1")}>
        <div className={cn("relative overflow-auto p-4 font-mono text-[12px] leading-relaxed", t.editor)}>
          {breadcrumb && (
            <div className="mb-2 flex items-center gap-1 text-[11px] text-muted-foreground">
              <span>app</span><ChevronRight className="size-3" /><span>page.tsx</span>
            </div>
          )}
          {minimap && (
            <div className="absolute right-1 top-1 h-32 w-12 rounded border border-dashed border-current/20 bg-current/5 p-1 text-[6px] leading-tight opacity-50">
              {Array.from({ length: 12 }).map((_, i) => <div key={i} className="mb-0.5 h-1 rounded-sm bg-current/30" style={{ width: `${30 + ((i * 17) % 60)}%` }} />)}
            </div>
          )}
          <pre className="">
          <Line n={1}><span className="text-violet-400">import</span> <span>{"{ Suspense }"}</span> <span className="text-violet-400">from</span> <span className="text-emerald-300">"react"</span>;</Line>
          <Line n={2}><span className="text-violet-400">import</span> <span>{"{ HeroSection }"}</span> <span className="text-violet-400">from</span> <span className="text-emerald-300">"@/components/hero"</span>;</Line>
          <Line n={3}> </Line>
          <Line n={4}><span className="text-sky-400">export default function</span> <span className="text-amber-300">Page</span>() {`{`}</Line>
          <Line n={5}>{"  "}<span className="text-violet-400">return</span> (</Line>
          <Line n={6}>{"    "}<span className="text-zinc-500">{"<main className=\"min-h-screen\">"}</span></Line>
          <Line n={7}>{"      "}<span className="text-zinc-500">{"<Suspense>"}</span></Line>
          <Line n={8}>{"        "}<span className="text-zinc-500">{"<HeroSection />"}</span></Line>
          <Line n={9}>{"      "}<span className="text-zinc-500">{"</Suspense>"}</span></Line>
          <Line n={10}>{"    "}<span className="text-zinc-500">{"</main>"}</span></Line>
          <Line n={11}>{"  "});</Line>
          <Line n={12}>{`}`}</Line>
        </pre>
        </div>
        {showRight && (
          <aside className={cn("border-l p-3 text-xs", t.border)}>
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider opacity-60">Inspector</p>
            <p className="opacity-70">Right panel — properties, references, AI assist.</p>
          </aside>
        )}
      </main>

      {/* bottom panel */}
      {showBottom && (
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
      )}

      {statusBar && (
        <footer className={cn("col-start-2 col-end-4 flex items-center justify-between border-t px-3 text-[10px] opacity-80", t.border)}>
          <div className="flex items-center gap-3"><span>main</span><span>UTF-8</span><span>TypeScript React</span></div>
          <div className="flex items-center gap-3"><span>Ln 7, Col 3</span><span>Spaces: 2</span></div>
        </footer>
      )}
    </div>
  );
}

function Line({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <div className="flex gap-4">
      <span className="w-6 select-none text-right text-zinc-600">{n}</span>
      <span>{children}</span>
    </div>
  );
}

function Tree({ node, depth = 0 }: { node: { name: string; expanded: boolean; children: string[] }; depth?: number }) {
  const [open, setOpen] = React.useState(node.expanded);
  return (
    <div>
      <Button
        type="button"
        variant="ghost"
        onClick={() => setOpen((o) => !o)}
        className="flex h-auto w-full items-center justify-start gap-1 rounded px-1 py-0.5 text-xs font-normal hover:bg-zinc-800/60"
        style={{ paddingLeft: depth * 8 }}
      >
        {open ? <ChevronDown className="size-3" /> : <ChevronRight className="size-3" />}
        <Folder className="size-3 text-amber-400" /> <span className="text-zinc-200">{node.name}</span>
      </Button>
      {open && (
        <ul className="ml-3 border-l border-zinc-800/80 pl-1">
          {node.children.map((c) => (
            <li key={c} className="flex items-center gap-1 py-0.5 text-zinc-400 hover:text-zinc-100">
              <FileCode2 className="size-3 text-sky-400" /> {c}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
