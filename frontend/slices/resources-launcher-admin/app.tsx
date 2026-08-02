"use client";

import { useCallback, useEffect, useState } from "react";
import { Link2, RefreshCw, Plus, Trash2, Pencil, ExternalLink, ArrowUp, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ResourceEditor } from "./components/resource-editor";
import { resolveIcon } from "./lib/icons";
import { useResourcesApi, type Resource } from "./lib/host";

// Default export so an os-shell can lazy-load this as a window app. Admin CRUD
// over a curated icon-launcher: add / edit / remove / reorder links that open in
// a new tab. Unwired it runs on an in-memory mock so it is fully interactive.
export default function ResourcesAdmin() {
  const api = useResourcesApi();
  const [rows, setRows] = useState<Resource[]>([]);
  const [editing, setEditing] = useState<Resource | "new" | null>(null);
  const [canManage, setCanManage] = useState(false);
  const [loading, setLoading] = useState(false);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      setCanManage((await api.canManage()) && api.canWrite);
      const list = await api.list();
      setRows([...list].sort((a, b) => a.order - b.order));
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    void reload().catch(() => {});
  }, [reload]);

  async function remove(r: Resource) {
    await api.remove(r.id);
    void reload();
  }

  // Reorder by swapping the order value with the adjacent row, then upsert both.
  async function move(i: number, dir: -1 | 1) {
    const j = i + dir;
    if (j < 0 || j >= rows.length) return;
    const a = rows[i];
    const b = rows[j];
    await api.upsert({ ...a, order: b.order });
    await api.upsert({ ...b, order: a.order });
    void reload();
  }

  return (
    <ScrollArea className="h-full bg-background text-foreground">
      <div className="p-5">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link2 className="size-5 text-primary" />
            <h2 className="text-base font-semibold">Resources Admin</h2>
          </div>
          {canManage && (
            <div className="flex items-center gap-1">
              <Button size="sm" variant="ghost" className="gap-1" onClick={() => setEditing("new")}>
                <Plus className="size-4" /> New
              </Button>
              <Button size="sm" variant="ghost" className="gap-1.5" onClick={() => void reload()} disabled={loading}>
                <RefreshCw className={"size-4 " + (loading ? "animate-spin" : "")} /> Reload
              </Button>
            </div>
          )}
        </div>

        {!canManage && (
          <p className="mb-4 rounded-lg border border-border bg-card p-3 text-sm text-muted-foreground">
            Read-only. Wire configureResources with upsert / remove / canManage for owner access.
          </p>
        )}

        {editing && canManage && (
          <ResourceEditor
            row={editing === "new" ? null : editing}
            onDone={() => {
              setEditing(null);
              void reload();
            }}
            onCancel={() => setEditing(null)}
          />
        )}

        <ul className="divide-y divide-border rounded-xl border border-border bg-card px-3">
          {rows.length === 0 ? (
            <li className="py-4 text-sm text-muted-foreground">No links yet. Add one with the New button.</li>
          ) : (
            rows.map((r, i) => {
              const Icon = resolveIcon(r.icon);
              return (
                <li key={r.id} className="flex items-center gap-2 py-2.5">
                  <Icon className="size-4 text-muted-foreground" />
                  <div className="min-w-[140px] flex-1">
                    <div className="text-sm font-medium">{r.label}</div>
                    <div className="truncate text-xs text-muted-foreground">
                      {r.group} · {r.url}
                    </div>
                  </div>
                  <a
                    href={r.url}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={"Open " + r.label}
                    className="text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <ExternalLink className="size-3.5" />
                  </a>
                  {canManage && (
                    <div className="flex items-center gap-0.5">
                      <Button size="icon" variant="ghost" className="size-8" onClick={() => void move(i, -1)} disabled={i === 0} aria-label="Move up">
                        <ArrowUp className="size-3.5" />
                      </Button>
                      <Button size="icon" variant="ghost" className="size-8" onClick={() => void move(i, 1)} disabled={i === rows.length - 1} aria-label="Move down">
                        <ArrowDown className="size-3.5" />
                      </Button>
                      <Button size="icon" variant="ghost" className="size-8" onClick={() => setEditing(r)} aria-label="Edit">
                        <Pencil className="size-3.5" />
                      </Button>
                      <Button size="icon" variant="ghost" className="size-8 text-destructive" onClick={() => void remove(r)} aria-label="Delete">
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  )}
                </li>
              );
            })
          )}
        </ul>
      </div>
    </ScrollArea>
  );
}
