"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { useStore } from "@/components/templates/personal-brand/shared/store";
import { WORKSPACE_BASE } from "@/components/templates/personal-brand/shared/nav-config";

export function NoteEditor({ id }: { id: string }) {
  const { state, dispatch } = useStore();
  const router = useRouter();
  const note = state.notes.find((n) => n.id === id);

  const [title, setTitle] = React.useState(note?.title ?? "");
  const [body, setBody] = React.useState(note?.body ?? "");
  const [dirty, setDirty] = React.useState(false);

  React.useEffect(() => {
    if (note) {
      setTitle(note.title);
      setBody(note.body);
      setDirty(false);
    }
  }, [note?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!note) {
    return (
      <Card className="p-8 text-center text-sm text-muted-foreground">
        Note not found.{" "}
        <Button variant="link" size="sm" onClick={() => router.push(`${WORKSPACE_BASE}/notes`)}>
          Back to notes
        </Button>
      </Card>
    );
  }

  function save() {
    dispatch({
      type: "note.upsert",
      note: { ...note!, title: title.trim() || "Untitled", body, updatedAt: Date.now() },
    });
    setDirty(false);
  }

  function remove() {
    if (!confirm(`Delete "${note!.title}"?`)) return;
    dispatch({ type: "note.delete", id: note!.id });
    router.push(`${WORKSPACE_BASE}/notes`);
  }

  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between gap-3">
        <Button variant="ghost" size="sm" onClick={() => router.push(`${WORKSPACE_BASE}/notes`)}>
          <ArrowLeft className="size-4" />
          All notes
        </Button>
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={save} disabled={!dirty}>
            {dirty ? "Save" : "Saved"}
          </Button>
          <Button variant="ghost" size="icon" onClick={remove} aria-label="Delete">
            <Trash2 className="size-4 text-muted-foreground" />
          </Button>
        </div>
      </header>

      <Input
        value={title}
        onChange={(e) => {
          setTitle(e.target.value);
          setDirty(true);
        }}
        placeholder="Untitled"
        className="text-lg font-semibold"
      />
      <Textarea
        value={body}
        onChange={(e) => {
          setBody(e.target.value);
          setDirty(true);
        }}
        placeholder="Start writing…"
        rows={18}
        className="font-mono text-sm leading-relaxed"
      />
      <p className="text-[11px] text-muted-foreground">
        Last updated {new Date(note.updatedAt).toLocaleString()}
      </p>
    </div>
  );
}
