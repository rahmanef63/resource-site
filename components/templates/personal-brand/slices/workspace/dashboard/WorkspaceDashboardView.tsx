"use client";

import Link from "next/link";
import { CheckSquare, StickyNote, Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useStore } from "@/components/templates/personal-brand/shared/store";
import { WORKSPACE_BASE } from "@/components/templates/personal-brand/shared/nav-config";

export function WorkspaceDashboardView() {
  const { state } = useStore();
  const ws = state.workspaces.find((w) => w.id === state.activeWorkspaceId);
  const notes = state.notes.filter((n) => n.workspaceId === state.activeWorkspaceId);
  const tasks = state.tasks.filter((t) => t.workspaceId === state.activeWorkspaceId);
  const openTasks = tasks.filter((t) => !t.done);
  const overdue = openTasks.filter((t) => t.dueDate && t.dueDate < Date.now());

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs uppercase tracking-wider text-muted-foreground">
          Workspace
        </p>
        <h1 className="mt-1 text-2xl font-semibold">
          {ws?.icon} {ws?.name ?? "Workspace"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Your scoped productivity surface — notes, tasks, and tools live here.
          Swap workspaces from the picker on{" "}
          <Link href={`${WORKSPACE_BASE}/manage`} className="underline">
            Workspaces
          </Link>
          .
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard icon={StickyNote} label="Notes" count={notes.length} href={`${WORKSPACE_BASE}/notes`} />
        <StatCard icon={CheckSquare} label="Open tasks" count={openTasks.length} href={`${WORKSPACE_BASE}/tasks`} sub={overdue.length ? `${overdue.length} overdue` : undefined} />
        <StatCard icon={Users} label="Workspaces" count={state.workspaces.length} href={`${WORKSPACE_BASE}/manage`} />
      </div>

      <Card className="p-6">
        <h2 className="mb-3 text-sm font-semibold">Recent notes</h2>
        {notes.length === 0 ? (
          <p className="text-sm text-muted-foreground">No notes yet.</p>
        ) : (
          <ul className="space-y-2">
            {notes
              .slice()
              .sort((a, b) => b.updatedAt - a.updatedAt)
              .slice(0, 5)
              .map((n) => (
                <li key={n.id} className="flex items-center justify-between rounded-md border bg-muted/30 p-3">
                  <div className="min-w-0">
                    <Link href={`${WORKSPACE_BASE}/notes/${n.id}`} className="block truncate text-sm font-medium hover:underline">
                      {n.title}
                    </Link>
                    <p className="truncate text-xs text-muted-foreground">{n.body}</p>
                  </div>
                  <Badge variant="outline" className="ml-2 shrink-0 text-[10px]">
                    {new Date(n.updatedAt).toLocaleDateString()}
                  </Badge>
                </li>
              ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  count,
  href,
  sub,
}: {
  icon: any;
  label: string;
  count: number;
  href: string;
  sub?: string;
}) {
  return (
    <Link href={href}>
      <Card className="p-4 transition-colors hover:bg-muted/40">
        <div className="flex items-center gap-3">
          <div className="grid size-9 place-items-center rounded-md bg-muted">
            <Icon className="size-4" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="text-xl font-semibold">{count}</p>
            {sub ? <p className="text-[11px] text-destructive">{sub}</p> : null}
          </div>
        </div>
      </Card>
    </Link>
  );
}
