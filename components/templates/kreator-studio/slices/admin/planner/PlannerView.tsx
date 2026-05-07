"use client";

import { CalendarDays, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SectionHead } from "@/components/templates/_shared/ui/section-head";
import { StatCard } from "@/components/templates/_shared/ui/stat-card";
import { fmtDate, useContents } from "../../../shared/store";

export function PlannerView() {
  const contents = useContents();
  const drafts = contents.filter((c) => c.status === "draft").length;
  const scheduled = contents.filter((c) => c.status === "scheduled").length;
  const ideas = contents.filter((c) => c.status === "idea").length;
  return (
    <div className="space-y-5">
      <SectionHead
        eyebrow="Planner"
        title="Content Calendar"
        subtitle="Plan IG, TikTok, YouTube, newsletter dari satu tempat."
      />
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard icon={CalendarDays} label="Total konten" value={contents.length} />
        <StatCard label="Ide" value={ideas} />
        <StatCard label="Draft" value={drafts} />
        <StatCard label="Terjadwal" value={scheduled} />
      </div>

      <div className="flex justify-end">
        <Button size="sm" className="gap-1"><Plus className="size-4" /> Konten baru</Button>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {contents.map((c) => (
          <Card key={c.id} className="border-border/60 bg-card/60">
            <CardContent className="space-y-2 p-5">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="rounded-full text-[10px] capitalize">{c.channel}</Badge>
                <Badge variant="outline" className="rounded-full text-[10px] capitalize">{c.status}</Badge>
              </div>
              <p className="text-sm font-medium">{c.title}</p>
              <p className="text-xs text-muted-foreground">{c.hook}</p>
              <p className="line-clamp-2 text-xs text-foreground/70">{c.body}</p>
              {c.scheduledAt > 0 && (
                <p className="pt-1 text-[11px] text-muted-foreground">Jadwal: {fmtDate(c.scheduledAt)}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
