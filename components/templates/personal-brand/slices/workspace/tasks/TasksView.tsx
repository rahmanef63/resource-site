"use client";

import * as React from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useStore } from "@/components/templates/personal-brand/shared/store";
import { nid } from "@/components/templates/_shared/utils";

export function TasksView() {
  const { state, dispatch } = useStore();
  const [newTitle, setNewTitle] = React.useState("");
  const [filter, setFilter] = React.useState<"all" | "open" | "done">("open");

  const tasks = React.useMemo(() => {
    return state.tasks
      .filter((t) => t.workspaceId === state.activeWorkspaceId)
      .filter((t) =>
        filter === "all" ? true : filter === "open" ? !t.done : t.done,
      )
      .sort((a, b) => Number(a.done) - Number(b.done) || b.createdAt - a.createdAt);
  }, [state.tasks, state.activeWorkspaceId, filter]);

  function addTask(e: React.FormEvent) {
    e.preventDefault();
    const title = newTitle.trim();
    if (!title) return;
    dispatch({
      type: "task.upsert",
      task: {
        id: nid("task"),
        workspaceId: state.activeWorkspaceId,
        title,
        done: false,
        createdAt: Date.now(),
      },
    });
    setNewTitle("");
  }

  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Tasks</h1>
          <p className="text-xs text-muted-foreground">
            {tasks.length} {filter === "all" ? "total" : filter}.
          </p>
        </div>
        <div className="flex gap-1">
          {(["open", "done", "all"] as const).map((f) => (
            <Button
              key={f}
              size="sm"
              variant={filter === f ? "default" : "ghost"}
              onClick={() => setFilter(f)}
            >
              {f}
            </Button>
          ))}
        </div>
      </header>

      <form onSubmit={addTask} className="flex gap-2">
        <Input
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="Add a task and press Enter…"
        />
        <Button type="submit" size="sm">
          <Plus className="size-4" />
          Add
        </Button>
      </form>

      {tasks.length === 0 ? (
        <Card className="p-8 text-center text-sm text-muted-foreground">
          Nothing here. Add your first task above.
        </Card>
      ) : (
        <ul className="grid gap-2">
          {tasks.map((t) => {
            const overdue = !t.done && t.dueDate && t.dueDate < Date.now();
            return (
              <li key={t.id}>
                <Card className="flex items-center gap-3 p-3">
                  <Checkbox
                    checked={t.done}
                    onCheckedChange={() => dispatch({ type: "task.toggle", id: t.id })}
                    aria-label={`Toggle ${t.title}`}
                  />
                  <div className="min-w-0 flex-1">
                    <p
                      className={cn(
                        "truncate text-sm",
                        t.done && "text-muted-foreground line-through",
                      )}
                    >
                      {t.title}
                    </p>
                    {t.dueDate ? (
                      <p className="text-[11px] text-muted-foreground">
                        Due {new Date(t.dueDate).toLocaleDateString()}
                      </p>
                    ) : null}
                  </div>
                  {overdue ? (
                    <Badge variant="destructive" className="text-[10px]">
                      overdue
                    </Badge>
                  ) : null}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => dispatch({ type: "task.delete", id: t.id })}
                    aria-label="Delete task"
                  >
                    <Trash2 className="size-4 text-muted-foreground" />
                  </Button>
                </Card>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
