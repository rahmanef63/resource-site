"use client";

import { Briefcase, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SectionHead } from "@/components/templates/_shared/ui/section-head";
import { StatCard } from "@/components/templates/_shared/ui/stat-card";
import { fmtDate, useClients, useProjects } from "../../../shared/store";

export function ProjectsView() {
  const projects = useProjects();
  const clients = useClients();
  const cmap = new Map(clients.map((c) => [c.id, c]));
  const active = projects.filter((p) => p.status !== "delivered").length;
  const avgProgress = projects.length ? Math.round(projects.reduce((s, p) => s + p.progress, 0) / projects.length) : 0;
  return (
    <div className="space-y-5">
      <SectionHead eyebrow="Projects" title="Project Tracker" subtitle="Status proyek live + progress milestone." />
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard icon={Briefcase} label="Total project" value={projects.length} />
        <StatCard label="Aktif" value={active} />
        <StatCard label="Avg progress" value={`${avgProgress}%`} />
      </div>

      <div className="flex justify-end">
        <Button size="sm" className="gap-1"><Plus className="size-4" /> Project baru</Button>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {projects.map((p) => (
          <Card key={p.id} className="border-border/60 bg-card/60">
            <CardContent className="space-y-2 p-5">
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="rounded-full text-[10px] capitalize">{p.status}</Badge>
                <span className="text-[11px] text-muted-foreground">{p.progress}%</span>
              </div>
              <p className="text-sm font-medium">{p.name}</p>
              <p className="text-xs text-muted-foreground">{cmap.get(p.clientId)?.company ?? "—"}</p>
              <p className="text-xs text-foreground/70">{p.description}</p>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted/40">
                <div className="h-full bg-foreground/70" style={{ width: `${p.progress}%` }} />
              </div>
              <p className="text-[11px] text-muted-foreground">
                {fmtDate(p.startedAt)} → {fmtDate(p.endsAt)}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
