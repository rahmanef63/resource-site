"use client";

import { Plus, ScrollText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SectionHead } from "@/components/templates/_shared/ui/section-head";
import { StatCard } from "@/components/templates/_shared/ui/stat-card";
import { fmtDate, useDocuments, useProjects } from "../../../shared/store";

export function DocumentsView() {
  const docs = useDocuments();
  const projects = useProjects();
  const pmap = new Map(projects.map((p) => [p.id, p]));
  const shared = docs.filter((d) => d.status === "shared").length;
  return (
    <div className="space-y-5">
      <SectionHead
        eyebrow="Documents"
        title="Deliverables & memo"
        subtitle="Semua dokumen klien, dikelompokkan per proyek."
      />
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard icon={ScrollText} label="Total dokumen" value={docs.length} />
        <StatCard label="Sudah dishare" value={shared} />
        <StatCard label="Draft" value={docs.length - shared} />
      </div>

      <div className="flex justify-end">
        <Button size="sm" className="gap-1"><Plus className="size-4" /> Dokumen baru</Button>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {docs.map((d) => (
          <Card key={d.id} className="border-border/60 bg-card/60">
            <CardContent className="space-y-1 p-5">
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="rounded-full text-[10px] capitalize">{d.kind}</Badge>
                <Badge variant="outline" className="rounded-full text-[10px] capitalize">{d.status}</Badge>
              </div>
              <p className="text-sm font-medium">{d.title}</p>
              <p className="text-[11px] text-muted-foreground">
                {pmap.get(d.projectId)?.name ?? "—"} · diperbarui {fmtDate(d.updatedAt)}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
