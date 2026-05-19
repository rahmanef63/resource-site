"use client";

import * as React from "react";
import Link from "next/link";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useStore } from "@/components/templates/personal-brand/shared/store";
import { WORKSPACE_BASE } from "@/components/templates/personal-brand/shared/nav-config";
import { nid } from "@/components/templates/_shared/utils";

export function NotesView() {
  const { state, dispatch } = useStore();
  const [query, setQuery] = React.useState("");

  const notes = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return state.notes
      .filter((n) => n.workspaceId === state.activeWorkspaceId)
      .filter((n) => !q || n.title.toLowerCase().includes(q) || n.body.toLowerCase().includes(q))
      .sort((a, b) => b.updatedAt - a.updatedAt);
  }, [state.notes, state.activeWorkspaceId, query]);

  function createNote() {
    const now = Date.now();
    const id = nid("note");
    dispatch({
      type: "note.upsert",
      note: {
        id,
        workspaceId: state.activeWorkspaceId,
        title: "Untitled",
        body: "",
        createdAt: now,
        updatedAt: now,
      },
    });
    window.location.href = `${WORKSPACE_BASE}/notes/${id}`;
  }

  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Notes</h1>
          <p className="text-xs text-muted-foreground">
            Scoped to the active workspace. {notes.length} item{notes.length === 1 ? "" : "s"}.
          </p>
        </div>
        <Button onClick={createNote} size="sm">
          <Plus className="size-4" />
          New note
        </Button>
      </header>

      <Input
        placeholder="Search notes…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="max-w-sm"
      />

      {notes.length === 0 ? (
        <Card className="p-8 text-center text-sm text-muted-foreground">
          No notes yet. Hit{" "}
          <Button onClick={createNote} variant="link" size="sm" className="px-1">
            New note
          </Button>{" "}
          to start.
        </Card>
      ) : (
        <ul className="grid gap-2">
          {notes.map((n) => (
            <li key={n.id}>
              <Card className="flex items-center gap-3 p-3 transition-colors hover:bg-muted/40">
                <Link href={`${WORKSPACE_BASE}/notes/${n.id}`} className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{n.title}</p>
                  <p className="line-clamp-1 text-xs text-muted-foreground">{n.body || "(empty)"}</p>
                </Link>
                <Badge variant="outline" className="shrink-0 text-[10px]">
                  {new Date(n.updatedAt).toLocaleDateString()}
                </Badge>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    if (confirm(`Delete "${n.title}"?`)) {
                      dispatch({ type: "note.delete", id: n.id });
                    }
                  }}
                  aria-label="Delete note"
                >
                  <Trash2 className="size-4 text-muted-foreground" />
                </Button>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
