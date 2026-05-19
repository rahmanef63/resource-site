"use client";

import * as React from "react";
import { Check, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useStore } from "@/components/templates/personal-brand/shared/store";
import { nid } from "@/components/templates/_shared/utils";

export function WorkspaceManageView() {
  const { state, dispatch } = useStore();
  const [adding, setAdding] = React.useState(false);
  const [draftName, setDraftName] = React.useState("");
  const [draftIcon, setDraftIcon] = React.useState("🧰");
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editName, setEditName] = React.useState("");
  const [editIcon, setEditIcon] = React.useState("");

  function createWorkspace(e: React.FormEvent) {
    e.preventDefault();
    const name = draftName.trim();
    if (!name) return;
    dispatch({
      type: "workspace.create",
      ws: { id: nid("ws"), name, icon: draftIcon || "📁", createdAt: Date.now() },
    });
    setDraftName("");
    setDraftIcon("🧰");
    setAdding(false);
  }

  function startEdit(id: string, name: string, icon: string) {
    setEditingId(id);
    setEditName(name);
    setEditIcon(icon);
  }

  function commitEdit() {
    if (!editingId) return;
    dispatch({
      type: "workspace.update",
      id: editingId,
      patch: { name: editName.trim() || "Untitled", icon: editIcon || "📁" },
    });
    setEditingId(null);
  }

  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Workspaces</h1>
          <p className="text-xs text-muted-foreground">
            Multiple contexts for your notes + tasks. Active workspace is highlighted.
          </p>
        </div>
        <Button size="sm" onClick={() => setAdding((v) => !v)}>
          <Plus className="size-4" />
          {adding ? "Cancel" : "New workspace"}
        </Button>
      </header>

      {adding ? (
        <Card className="p-4">
          <form onSubmit={createWorkspace} className="flex flex-wrap items-end gap-2">
            <div className="w-16">
              <label className="text-[11px] text-muted-foreground">Icon</label>
              <Input
                value={draftIcon}
                onChange={(e) => setDraftIcon(e.target.value.slice(0, 4))}
                className="text-center text-lg"
                maxLength={4}
              />
            </div>
            <div className="flex-1 min-w-[12rem]">
              <label className="text-[11px] text-muted-foreground">Name</label>
              <Input
                value={draftName}
                onChange={(e) => setDraftName(e.target.value)}
                placeholder="Side project / Client / …"
                autoFocus
              />
            </div>
            <Button type="submit" size="sm">Create</Button>
          </form>
        </Card>
      ) : null}

      <ul className="grid gap-2">
        {state.workspaces.map((w) => {
          const isActive = w.id === state.activeWorkspaceId;
          const editing = editingId === w.id;
          const canDelete = state.workspaces.length > 1;
          return (
            <li key={w.id}>
              <Card
                className={cn(
                  "flex items-center gap-3 p-3 transition-colors",
                  isActive && "border-foreground/40 bg-muted/50",
                )}
              >
                {editing ? (
                  <>
                    <Input
                      value={editIcon}
                      onChange={(e) => setEditIcon(e.target.value.slice(0, 4))}
                      className="w-14 text-center text-lg"
                      maxLength={4}
                    />
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      autoFocus
                      className="flex-1"
                    />
                    <Button size="sm" onClick={commitEdit}>
                      <Check className="size-4" />
                      Save
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setEditingId(null)}>
                      Cancel
                    </Button>
                  </>
                ) : (
                  <>
                    <div className="grid size-9 place-items-center rounded-md bg-muted text-lg">
                      {w.icon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{w.name}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {state.notes.filter((n) => n.workspaceId === w.id).length} notes ·{" "}
                        {state.tasks.filter((t) => t.workspaceId === w.id).length} tasks
                      </p>
                    </div>
                    {isActive ? (
                      <Badge>Active</Badge>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => dispatch({ type: "workspace.switch", id: w.id })}
                      >
                        Switch
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => startEdit(w.id, w.name, w.icon)}
                      aria-label="Rename"
                    >
                      <Pencil className="size-4 text-muted-foreground" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        if (!canDelete) return;
                        if (confirm(`Delete workspace "${w.name}"? Notes + tasks will be lost.`)) {
                          dispatch({ type: "workspace.delete", id: w.id });
                        }
                      }}
                      disabled={!canDelete}
                      aria-label="Delete"
                    >
                      <Trash2 className="size-4 text-muted-foreground" />
                    </Button>
                  </>
                )}
              </Card>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
