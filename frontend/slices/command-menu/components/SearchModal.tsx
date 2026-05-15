"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Search, FileText, Clock, Database as DatabaseIcon, Loader2 } from "lucide-react";
import { DEFAULT_SEARCH_LABELS, type SearchModalLabels } from "../lib/types";

/** Generic, normalized hit shape — the modal only renders these fields,
 *  it does NOT know how the consumer fetched them. */
export interface SearchHit {
  id: string;
  /** Visible row title. Falls back to "Untitled" when blank. */
  title: string;
  /** Optional secondary text rendered under the title. */
  subtitle?: string;
  /** Optional consumer-rendered icon node (use any icon picker / lucide). */
  icon?: ReactNode;
}

/** Bindings exposed by the consumer. Keep generic — no Convex / store /
 *  router types leak through. */
export interface SearchModalBindings {
  /** Current loading state for the active query. */
  isLoading: boolean;
  /** Page-kind hits for the current query. */
  pages: SearchHit[];
  /** Database-kind hits for the current query. */
  databases: SearchHit[];
  /** Recent items shown when the query is empty. */
  recents: SearchHit[];
  /** Called whenever the query input changes (debouncing is up to consumer). */
  onQueryChange: (q: string) => void;
  /** Navigate to a page hit. The modal closes immediately after. */
  onSelectPage: (hit: SearchHit) => void;
  /** Navigate to a database hit. The modal closes immediately after. */
  onSelectDatabase: (hit: SearchHit) => void;
}

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  /** Override copy strings. Defaults are generic English. */
  labels?: SearchModalLabels;
  /** Consumer-supplied data + handlers. */
  bindings: SearchModalBindings;
}

/** Renderless search modal. Owns dialog chrome, query input, section
 *  layout, and empty/loading states. ALL data + navigation flow comes
 *  from the `bindings` prop so the slice is portable. */
export function SearchModal({ open, onOpenChange, labels, bindings }: Props) {
  const t = { ...DEFAULT_SEARCH_LABELS, ...labels };
  const [q, setQ] = useState("");
  const totalHits = bindings.pages.length + bindings.databases.length;
  const recent = !q ? bindings.recents.slice(0, 5) : [];

  useEffect(() => { if (!open) setQ(""); }, [open]);

  const handleQ = (v: string) => {
    setQ(v);
    bindings.onQueryChange(v);
  };

  const goPage = (hit: SearchHit) => { bindings.onSelectPage(hit); onOpenChange(false); };
  const goDb = (hit: SearchHit) => { bindings.onSelectDatabase(hit); onOpenChange(false); };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 overflow-hidden max-w-xl gap-0 top-[20%] translate-y-0">
        <DialogTitle className="sr-only">{t.searchTitle}</DialogTitle>
        <DialogDescription className="sr-only">
          {t.searchDescription}
        </DialogDescription>
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            autoFocus
            value={q}
            onChange={e => handleQ(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          {bindings.isLoading && <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />}
          <kbd className="text-[10px] text-muted-foreground border border-border rounded px-1.5 py-0.5">{t.escapeHint}</kbd>
        </div>
        <div className="max-h-[420px] overflow-y-auto p-2">
          {q && !bindings.isLoading && totalHits === 0 && (
            <div className="px-3 py-8 text-center text-sm text-muted-foreground">{t.noResults(q)}</div>
          )}
          {!q && recent.length > 0 && (
            <>
              <SectionHeader icon={<Clock className="h-3 w-3" />}>{t.recentHeading}</SectionHeader>
              {recent.map(p => (
                <Row key={p.id} hit={p} onClick={() => goPage(p)} kind="page" />
              ))}
            </>
          )}
          {bindings.pages.length > 0 && (
            <>
              <SectionHeader icon={<FileText className="h-3 w-3" />}>{t.pagesHeading}</SectionHeader>
              {bindings.pages.map(p => (
                <Row key={p.id} hit={p} onClick={() => goPage(p)} kind="page" />
              ))}
            </>
          )}
          {bindings.databases.length > 0 && (
            <>
              <SectionHeader icon={<DatabaseIcon className="h-3 w-3" />}>{t.databasesHeading}</SectionHeader>
              {bindings.databases.map(d => (
                <Row key={d.id} hit={d} onClick={() => goDb(d)} kind="db" />
              ))}
            </>
          )}
          {!q && recent.length === 0 && (
            <div className="px-3 py-8 text-center text-sm text-muted-foreground">{t.emptyHint}</div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function SectionHeader({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <div className="px-3 py-1.5 text-[11px] uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-1.5">
      {icon} {children}
    </div>
  );
}

function Row({
  hit,
  onClick,
  kind,
}: {
  hit: SearchHit;
  onClick: () => void;
  kind: "page" | "db";
}) {
  const TrailIcon = kind === "db" ? DatabaseIcon : FileText;
  const title = hit.title || "Untitled";
  return (
    <button onClick={onClick} className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left hover:bg-accent transition">
      {hit.icon ?? <TrailIcon className="h-4 w-4 text-muted-foreground" />}
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium">{title}</div>
        {hit.subtitle && <div className="truncate text-xs text-muted-foreground">{hit.subtitle}</div>}
      </div>
      <TrailIcon className="h-3.5 w-3.5 text-muted-foreground" />
    </button>
  );
}
