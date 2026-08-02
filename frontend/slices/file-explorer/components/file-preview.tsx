"use client";
/* File preview lightbox (shadcn Dialog). Opened from the explorer when a
   previewable file is opened (double-click / Enter / tap). Resolves the bytes
   URL (async `readUrl` for Convex storage, else the sync `rawUrl`) and maps the
   kind → element: <img> / <audio controls autoPlay> / <video> / sandboxed pdf
   <iframe> / <pre> for text. Degrades to an icon+name+size card when there is
   no blob (mock adapter, or files with no storage) — never a broken media tag. */
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useFsAdapter, type FsEntry } from "../adapter";
import { previewKind, iconFor, colorFor } from "../lib/icons";
import { fmtSize } from "../lib/format";

const MAX_TEXT = 512 * 1024; // don't slurp huge files into a <pre>
type Status = "loading" | "ready" | "noblob" | "error";

export function FilePreview({ path, entry, onClose }: { path: string; entry: FsEntry; onClose: () => void }) {
  const { fs } = useFsAdapter();
  const kind = previewKind(entry);
  const [status, setStatus] = useState<Status>("loading");
  const [src, setSrc] = useState<string | null>(null);
  const [text, setText] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    setStatus("loading"); setSrc(null); setText(null);
    (async () => {
      if (kind === "text") {
        // Inline content first (Convex /Database JSON rows + write-created
        // files), then a blob fetch (uploaded .txt/.md). Mock has neither.
        const doc = await fs.read?.(path);
        if (!alive) return;
        if (doc?.content != null) { setText(doc.content); setStatus("ready"); return; }
        const turl = (await fs.readUrl?.(path)) || fs.rawUrl(path);
        if (!alive) return;
        if (!turl) { setStatus("noblob"); return; }
        if (entry.size > MAX_TEXT) { setStatus("error"); return; }
        try { const t = await fetch(turl).then((r) => r.text()); if (alive) { setText(t); setStatus("ready"); } }
        catch { if (alive) setStatus("error"); }
        return;
      }
      // media (image/audio/video/pdf): resolve a bytes URL. Convex readUrl is
      // async; live is sync; mock -> "" -> icon fallback, never a broken tag.
      const url = (await fs.readUrl?.(path)) || fs.rawUrl(path);
      if (!alive) return;
      if (!url) { setStatus("noblob"); return; }
      setSrc(url); setStatus("ready");
    })();
    return () => { alive = false; };
  }, [fs, path, kind, entry.size]);

  const Icon = iconFor(entry);
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-3xl gap-0 p-0 sm:max-w-4xl">
        <DialogTitle className="truncate border-b border-border px-4 py-2 text-sm">{entry.name}</DialogTitle>
        <div className="flex max-h-[75vh] min-h-[40vh] items-center justify-center overflow-auto bg-muted/20 p-3">
          {status === "loading" && (
            <span className="flex items-center gap-2 text-xs text-muted-foreground"><Loader2 className="size-4 animate-spin" /> Loading…</span>
          )}
          {(status === "noblob" || status === "error" || !kind) && (
            <div className="flex flex-col items-center gap-2 p-8 text-center">
              <Icon className={cn("size-12", colorFor(entry))} />
              <span className="text-sm font-medium">{entry.name}</span>
              <span className="text-xs text-muted-foreground">{fmtSize(entry.size)} · No preview available</span>
            </div>
          )}
          {status === "ready" && kind === "image" && src && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={src} alt={entry.name} className="max-h-[72vh] max-w-full object-contain" />
          )}
          {status === "ready" && kind === "audio" && src && (<audio src={src} controls autoPlay className="w-full max-w-xl" />)}
          {status === "ready" && kind === "video" && src && (<video src={src} controls className="max-h-[72vh] max-w-full" />)}
          {status === "ready" && kind === "pdf" && src && (
            <iframe src={src} title={entry.name}
              // No allow-scripts: the browser renders a real PDF without it, and
              // a .pdf node whose bytes are actually text/html can't execute.
              sandbox="allow-same-origin" referrerPolicy="no-referrer"
              className="h-[72vh] w-full rounded border border-border bg-white" />
          )}
          {status === "ready" && kind === "text" && text != null && (
            <pre className="max-h-[72vh] w-full overflow-auto rounded bg-background p-3 text-left text-xs whitespace-pre-wrap">{text}</pre>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
