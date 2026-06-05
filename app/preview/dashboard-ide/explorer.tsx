"use client";

import * as React from "react";
import { ChevronDown, ChevronRight, FileCode2, FileJson2, FileText, Folder, FolderOpen, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { listDir, type DirEntry } from "./mock-data";

// Lazy explorer — the IDE rule that keeps RAM flat on big repos:
//   • a folder's children are fetched ONLY when it is expanded;
//   • collapsing drops both the fetched listing and the child DOM, so the
//     mounted tree is always just the visible rows;
//   • nothing below an unexpanded folder (e.g. node_modules) ever loads.
// Production version of this pattern: the `file-explorer` slice
// (FileExplorerAdapter.list(path) per expand) — swap listDir for an adapter.

function fileIcon(name: string) {
  if (name.endsWith(".json")) return <FileJson2 className="size-3 shrink-0 text-amber-300" />;
  if (name.endsWith(".md") || name.endsWith(".css")) return <FileText className="size-3 shrink-0 text-zinc-400" />;
  return <FileCode2 className="size-3 shrink-0 text-sky-400" />;
}

function FolderRow({ path, name, depth, active, onOpen }: {
  path: string;
  name: string;
  depth: number;
  active: string | null;
  onOpen: (path: string) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const [entries, setEntries] = React.useState<DirEntry[] | null>(null);
  const [loading, setLoading] = React.useState(false);

  const toggle = () => {
    if (open) {
      // Collapse = unmount children AND drop their listing from memory.
      setOpen(false);
      setEntries(null);
      return;
    }
    setOpen(true);
    setLoading(true);
    void listDir(path).then((e) => {
      setEntries(e);
      setLoading(false);
    });
  };

  return (
    <div>
      <Button
        type="button"
        variant="ghost"
        onClick={toggle}
        className="flex h-auto w-full items-center justify-start gap-1 rounded px-1 py-0.5 text-xs font-normal text-zinc-300 hover:bg-zinc-800/60 hover:text-zinc-100"
        style={{ paddingLeft: 4 + depth * 10 }}
      >
        {open ? <ChevronDown className="size-3 shrink-0" /> : <ChevronRight className="size-3 shrink-0" />}
        {open ? <FolderOpen className="size-3 shrink-0 text-amber-400" /> : <Folder className="size-3 shrink-0 text-amber-400" />}
        <span className="truncate">{name}</span>
        {loading && <Loader2 className="ml-auto size-3 shrink-0 animate-spin text-zinc-500" />}
      </Button>
      {open && entries && (
        <div className="relative">
          <span className="absolute bottom-0 top-0 w-px bg-zinc-800/80" style={{ left: 9 + depth * 10 }} />
          <Rows entries={entries} base={path} depth={depth + 1} active={active} onOpen={onOpen} />
          {entries.length === 0 && (
            <p className="py-0.5 text-[10px] italic text-zinc-600" style={{ paddingLeft: 22 + depth * 10 }}>empty</p>
          )}
        </div>
      )}
    </div>
  );
}

function Rows({ entries, base, depth, active, onOpen }: {
  entries: DirEntry[];
  base: string;
  depth: number;
  active: string | null;
  onOpen: (path: string) => void;
}) {
  return (
    <>
      {entries.map((e) => {
        const full = base ? `${base}/${e.name}` : e.name;
        return e.kind === "dir" ? (
          <FolderRow key={full} path={full} name={e.name} depth={depth} active={active} onOpen={onOpen} />
        ) : (
          <Button
            key={full}
            type="button"
            variant="ghost"
            onClick={() => onOpen(full)}
            className={cn(
              "flex h-auto w-full items-center justify-start gap-1 rounded px-1 py-0.5 text-xs font-normal hover:bg-zinc-800/60",
              active === full ? "bg-zinc-800/80 text-zinc-100" : "text-zinc-400 hover:text-zinc-100",
            )}
            style={{ paddingLeft: 18 + depth * 10 }}
          >
            {fileIcon(e.name)}
            <span className="truncate">{e.name}</span>
          </Button>
        );
      })}
    </>
  );
}

export function ExplorerSidebar({ active, onOpen }: { active: string | null; onOpen: (path: string) => void }) {
  const [root, setRoot] = React.useState<DirEntry[] | null>(null);

  // Only the TOP level loads on mount; everything deeper waits for expand.
  React.useEffect(() => {
    void listDir("").then(setRoot);
  }, []);

  return (
    <aside className="col-start-2 row-start-2 row-end-3 flex flex-col overflow-hidden border-r border-zinc-800 bg-zinc-900/30 text-xs">
      <p className="px-3 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
        Explorer
      </p>
      <div className="min-h-0 flex-1 overflow-y-auto px-1 pb-2">
        {root === null ? (
          <p className="flex items-center gap-1.5 px-2 py-1 text-zinc-500"><Loader2 className="size-3 animate-spin" /> loading…</p>
        ) : (
          <Rows entries={root} base="" depth={0} active={active} onOpen={onOpen} />
        )}
      </div>
    </aside>
  );
}
