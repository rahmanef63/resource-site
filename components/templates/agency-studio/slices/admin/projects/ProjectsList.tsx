"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { fmtDate, useStore } from "../../../shared/store";
import { ADMIN_BASE } from "../../../shared/nav-config";

const STATUS_LABELS: Record<string, string> = {
  discovery: "Discovery",
  design: "Design",
  build: "Build",
  delivered: "Delivered",
  archived: "Archived",
};

export function ProjectsList() {
  const { state } = useStore();
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Projects</h1>
          <p className="text-sm text-muted-foreground">{state.projects.length} total · {state.projects.filter((p) => p.status !== "delivered" && p.status !== "archived").length} active</p>
        </div>
        <Button asChild size="sm">
          <Link href={`${ADMIN_BASE}/projects/new`}><Plus className="size-4" /> New project</Link>
        </Button>
      </div>
      <Card className="border-border/60">
        <CardContent className="p-0">
          <ul className="divide-y divide-border/60">
            {state.projects.map((p) => (
              <li key={p.id} className="flex items-center gap-4 px-5 py-3 text-sm">
                <div className="size-10 shrink-0 rounded-md bg-cover bg-center" style={{ backgroundImage: `url(${p.cover})` }} />
                <div className="flex-1 truncate">
                  <p className="truncate font-medium">{p.title}</p>
                  <p className="truncate text-xs text-muted-foreground">{p.client} · {p.category}</p>
                </div>
                <Badge variant="outline">{STATUS_LABELS[p.status] ?? p.status}</Badge>
                <span className="hidden text-xs text-muted-foreground md:inline">{fmtDate(p.publishedAt)}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
