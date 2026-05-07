"use client";

import { Plus, Quote } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SectionHead } from "@/components/templates/_shared/ui/section-head";
import { StatCard } from "@/components/templates/_shared/ui/stat-card";
import { useCitations } from "../../../shared/store";

export function CitationsView() {
  const citations = useCitations();
  const styleCount = new Set(citations.map((c) => c.style)).size;
  return (
    <div className="space-y-5">
      <SectionHead eyebrow="Sitasi" title="Citation Manager" subtitle="APA, MLA, Chicago, IEEE, BibTeX — semua style siap export." />
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard icon={Quote} label="Total sitasi" value={citations.length} />
        <StatCard label="Style aktif" value={styleCount} />
        <StatCard label="Format ekspor" value="5" />
      </div>

      <div className="flex justify-end">
        <Button size="sm" className="gap-1"><Plus className="size-4" /> Sitasi baru</Button>
      </div>

      <div className="grid gap-3">
        {citations.map((c) => (
          <Card key={c.id} className="border-border/60 bg-card/60">
            <CardContent className="space-y-2 p-5">
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="rounded-full text-[10px]">{c.style}</Badge>
                <code className="text-[11px] text-muted-foreground">{c.bibKey}</code>
              </div>
              <p className="font-mono text-xs text-foreground/85">{c.rendered}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
