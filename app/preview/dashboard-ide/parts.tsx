"use client";

import * as React from "react";
import {
  FileCode2, Search, GitBranch, Bug, Settings, Folder, ChevronRight, ChevronDown,
  Terminal, AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { TREE, type ThemeId, THEMES } from "./mock-data";

export function Line({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <div className="flex gap-4">
      <span className="w-6 select-none text-right text-zinc-600">{n}</span>
      <span>{children}</span>
    </div>
  );
}

export function Tree({ node, depth = 0 }: { node: { name: string; expanded: boolean; children: string[] }; depth?: number }) {
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

export function ExplorerSidebar() {
  return (
    <aside className="row-start-2 row-end-4 border-r border-zinc-800 bg-zinc-900/30 p-2 text-xs">
      <p className="mb-2 px-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
        Explorer
      </p>
      {TREE.map((node) => (
        <Tree key={node.name} node={node} />
      ))}
    </aside>
  );
}

export function EditorContent({ minimap, breadcrumb }: { minimap: boolean; breadcrumb: boolean }) {
  return (
    <>
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

export function StatusBar({ t }: { t: typeof THEMES[ThemeId] }) {
  return (
    <footer className={cn("col-start-2 col-end-4 flex items-center justify-between border-t px-3 text-[10px] opacity-80", t.border)}>
      <div className="flex items-center gap-3"><span>main</span><span>UTF-8</span><span>TypeScript React</span></div>
      <div className="flex items-center gap-3"><span>Ln 7, Col 3</span><span>Spaces: 2</span></div>
    </footer>
  );
}
