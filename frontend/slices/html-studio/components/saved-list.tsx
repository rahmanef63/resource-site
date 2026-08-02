"use client";
/* Saved-pages rail + published-link strip for the HTML Studio. Presentational:
   explicit props, no hooks. */
import { Lock, Link2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cx, shareUrl } from "../lib/util";
import type { PageRow } from "../lib/host";

export function ShareStrip({ slug, isPrivate, onCopy }: { slug: string; isPrivate: boolean; onCopy: () => void }) {
  return (
    <Button
      type="button"
      variant="ghost"
      onClick={onCopy}
      title="Copy link"
      className="flex h-auto w-full shrink-0 items-center justify-start gap-1.5 rounded-none border-b border-border bg-muted/40 px-3 py-1 text-left text-[11px] font-normal text-muted-foreground"
    >
      {isPrivate ? <Lock className="size-3 shrink-0" /> : <Link2 className="size-3 shrink-0" />}
      <span className="truncate font-mono">{shareUrl(slug)}</span>
      {isPrivate && <span className="ml-1 shrink-0 rounded bg-muted px-1 text-[10px]">private</span>}
    </Button>
  );
}

export function SavedList({
  rows,
  slug,
  onOpen,
  onRemove,
}: {
  rows: PageRow[];
  slug: string | null;
  onOpen: (s: string) => void;
  onRemove: (s: string) => void;
}) {
  return (
    <aside className="flex w-56 shrink-0 flex-col border-r border-border bg-card">
      <div className="border-b border-border px-3 py-2 text-xs font-semibold">Saved</div>
      <ScrollArea className="flex-1">
        {rows.length === 0 ? (
          <p className="px-3 py-3 text-[11px] text-muted-foreground">No pages yet.</p>
        ) : (
          <ul className="p-1.5">
            {rows.map((r) => (
              <li key={r.slug} className={cx("group flex items-center gap-1 rounded", r.slug === slug && "bg-accent")}>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => onOpen(r.slug)}
                  className="h-auto min-w-0 flex-1 flex-col items-start gap-0 px-1.5 py-1 text-left font-normal hover:bg-accent"
                >
                  <span className="flex w-full items-center gap-1 truncate text-xs">
                    {r.visibility === "private" && <Lock className="size-2.5 shrink-0" />}
                    <span className="truncate">{r.title}</span>
                  </span>
                  <span className="block w-full truncate font-mono text-[10px] text-muted-foreground">/p/{r.slug}</span>
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => onRemove(r.slug)}
                  title="Delete"
                  className="size-7 shrink-0 text-muted-foreground opacity-0 hover:text-destructive group-hover:opacity-100"
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </ScrollArea>
    </aside>
  );
}
