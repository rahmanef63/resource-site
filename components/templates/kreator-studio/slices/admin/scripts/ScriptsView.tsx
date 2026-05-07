"use client";

import { FileText, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SectionHead } from "@/components/templates/_shared/ui/section-head";
import { StatCard } from "@/components/templates/_shared/ui/stat-card";
import { fmtDate, useScripts } from "../../../shared/store";

export function ScriptsView() {
  const scripts = useScripts();
  const totalSec = scripts.reduce((s, x) => s + x.durationSec, 0);
  return (
    <div className="space-y-5">
      <SectionHead
        eyebrow="Scripts"
        title="Script Library"
        subtitle="Template hook, beat, dan CTA — siap shoot."
      />
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard icon={FileText} label="Total scripts" value={scripts.length} />
        <StatCard label="Total durasi" value={`${Math.round(totalSec / 60)} menit`} />
        <StatCard label="Channels aktif" value={new Set(scripts.map((s) => s.channel)).size} />
      </div>

      <div className="flex justify-end">
        <Button size="sm" className="gap-1"><Plus className="size-4" /> Script baru</Button>
      </div>

      <div className="grid gap-3">
        {scripts.map((s) => (
          <Card key={s.id} className="border-border/60 bg-card/60">
            <CardContent className="space-y-2 p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="rounded-full text-[10px] capitalize">{s.channel}</Badge>
                  <Badge variant="outline" className="rounded-full text-[10px]">{s.durationSec}s</Badge>
                </div>
                <span className="text-[11px] text-muted-foreground">{fmtDate(s.updatedAt)}</span>
              </div>
              <p className="text-sm font-medium">{s.title}</p>
              <p className="text-xs italic text-muted-foreground">"{s.hook}"</p>
              <ul className="space-y-0.5 text-xs text-foreground/80">
                {s.beats.map((b, i) => <li key={i}>{b}</li>)}
              </ul>
              <p className="pt-1 text-[11px] text-muted-foreground"><strong>CTA:</strong> {s.cta}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
