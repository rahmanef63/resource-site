"use client";
/* Properties dialog — edit a file's body (text/html/json/etc via the adapter's
   `write`) and its metadata (a custom icon glyph, an endpoint URL, and arbitrary
   key/value pairs via `setMeta`). Read-only info (name/path/size/kind) up top.
   Gracefully degrades: an adapter missing write/setMeta hides those sections. */
import { useEffect, useState } from "react";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useFsAdapter, type FsEntry } from "../adapter";
import { previewKind } from "../lib/icons";
import { fmtSize } from "../lib/format";

type Row = { k: string; v: string };
const RESERVED = new Set(["icon", "endpoint"]);

export function FileProperties({
  path,
  entry,
  onClose,
  onSaved,
}: {
  path: string;
  entry: FsEntry;
  onClose: () => void;
  onSaved: () => void;
}) {
  const { fs } = useFsAdapter();
  const canEditBody = entry.kind === "file" && previewKind(entry) === "text" && !!fs.write;
  const canEditMeta = !!fs.setMeta;
  const [content, setContent] = useState<string | null>(null);
  const [original, setOriginal] = useState<string | null>(null); // guards blind overwrite
  const [icon, setIcon] = useState(entry.meta?.icon ?? "");
  const [endpoint, setEndpoint] = useState(entry.meta?.endpoint ?? "");
  const [rows, setRows] = useState<Row[]>(
    Object.entries(entry.meta ?? {})
      .filter(([k]) => !RESERVED.has(k))
      .map(([k, v]) => ({ k, v })),
  );
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!canEditBody) return;
    let alive = true;
    fs.read?.(path)
      .then((d) => { if (alive) { const c = d?.content ?? ""; setContent(c); setOriginal(c); } })
      .catch(() => { if (alive) { setContent(""); setOriginal(""); } });
    return () => { alive = false; };
  }, [fs, path, canEditBody]);

  const save = async () => {
    setBusy(true);
    setErr(null);
    try {
      // Only write when the body actually loaded AND changed — never clobber a
      // file with "" just because read() returned nothing.
      if (canEditBody && content != null && content !== original) await fs.write!(path, content);
      if (canEditMeta) {
        const meta: Record<string, string> = {};
        if (icon.trim()) meta.icon = icon.trim();
        if (endpoint.trim()) meta.endpoint = endpoint.trim();
        for (const { k, v } of rows) {
          const key = k.trim();
          if (key && !RESERVED.has(key)) meta[key] = v; // dedicated Icon/Endpoint win
        }
        await fs.setMeta!(path, meta);
      }
      onSaved();
      onClose();
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
      setBusy(false);
    }
  };

  const kind = entry.kind === "dir" ? "Folder" : (entry.ext ?? "").toUpperCase() || "File";

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg gap-0 p-0">
        <DialogTitle className="truncate border-b border-border px-4 py-2 text-sm">
          Properties — {entry.name}
        </DialogTitle>
        <div className="max-h-[70vh] space-y-4 overflow-auto p-4">
          <dl className="grid grid-cols-[64px_1fr] gap-x-3 gap-y-1 text-xs">
            <dt className="text-muted-foreground">Path</dt>
            <dd className="truncate font-mono" title={path}>{path}</dd>
            <dt className="text-muted-foreground">Kind</dt>
            <dd>{kind}</dd>
            {entry.kind === "file" && (
              <>
                <dt className="text-muted-foreground">Size</dt>
                <dd className="tabular-nums">{fmtSize(entry.size)}</dd>
              </>
            )}
          </dl>

          {canEditMeta && (
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <label className="space-y-1 text-xs">
                  <span className="text-muted-foreground">Icon (emoji)</span>
                  <Input value={icon} onChange={(e) => setIcon(e.target.value)} placeholder="🌐" className="h-8" />
                </label>
                <label className="space-y-1 text-xs">
                  <span className="text-muted-foreground">Endpoint</span>
                  <Input value={endpoint} onChange={(e) => setEndpoint(e.target.value)} placeholder="https://…" className="h-8" />
                </label>
              </div>
              <div className="space-y-1.5">
                <span className="text-xs text-muted-foreground">Custom fields</span>
                {rows.map((r, i) => (
                  <div key={i} className="flex gap-2">
                    <Input value={r.k} onChange={(e) => setRows((p) => p.map((x, j) => (j === i ? { ...x, k: e.target.value } : x)))} placeholder="key" className="h-8" />
                    <Input value={r.v} onChange={(e) => setRows((p) => p.map((x, j) => (j === i ? { ...x, v: e.target.value } : x)))} placeholder="value" className="h-8" />
                    <Button type="button" variant="ghost" size="icon" className="size-8 shrink-0" aria-label="Remove field" onClick={() => setRows((p) => p.filter((_, j) => j !== i))}>
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" className="h-7 gap-1.5 text-xs" onClick={() => setRows((p) => [...p, { k: "", v: "" }])}>
                  <Plus className="size-3.5" /> Add field
                </Button>
              </div>
            </div>
          )}

          {canEditBody && (
            <label className="block space-y-1">
              <span className="text-xs text-muted-foreground">Content</span>
              {content == null ? (
                <span className="flex items-center gap-2 text-xs text-muted-foreground"><Loader2 className="size-3.5 animate-spin" /> Loading…</span>
              ) : (
                <textarea value={content} onChange={(e) => setContent(e.target.value)} spellCheck={false} className="min-h-[220px] w-full resize-y rounded-md border border-border bg-background p-2 font-mono text-xs" />
              )}
            </label>
          )}

          {!canEditBody && !canEditMeta && (
            <p className="text-xs text-muted-foreground">This backend is read-only.</p>
          )}
          {err && <p className="text-xs text-destructive">{err}</p>}
        </div>
        <div className="flex justify-end gap-2 border-t border-border px-4 py-2.5">
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
          <Button type="button" size="sm" disabled={busy || (!canEditBody && !canEditMeta)} onClick={save}>
            {busy && <Loader2 className="size-3.5 animate-spin" />} Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
