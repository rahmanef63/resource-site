"use client";

import { FileImage, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SectionHead } from "@/components/templates/_shared/ui/section-head";
import { StatCard } from "@/components/templates/_shared/ui/stat-card";
import { fmtDate, useCarousels } from "../../../shared/store";

export function CarouselsView() {
  const carousels = useCarousels();
  const totalSlides = carousels.reduce((s, c) => s + c.slides.length, 0);
  return (
    <div className="space-y-5">
      <SectionHead
        eyebrow="Carousels"
        title="Carousel Builder"
        subtitle="Multi-slide untuk IG carousel, LinkedIn document, Twitter thread."
      />
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard icon={FileImage} label="Total carousels" value={carousels.length} />
        <StatCard label="Total slides" value={totalSlides} />
        <StatCard label="Avg per carousel" value={carousels.length ? Math.round(totalSlides / carousels.length) : 0} />
      </div>

      <div className="flex justify-end">
        <Button size="sm" className="gap-1"><Plus className="size-4" /> Carousel baru</Button>
      </div>

      <div className="space-y-4">
        {carousels.map((c) => (
          <Card key={c.id} className="border-border/60 bg-card/60">
            <CardContent className="space-y-3 p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">{c.title}</p>
                <Badge variant="outline" className="rounded-full text-[10px] capitalize">{c.channel}</Badge>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {c.slides.map((s, i) => (
                  <div key={i} className="min-w-[180px] rounded-md border border-border/60 bg-muted/20 p-3">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Slide {i + 1}</p>
                    <p className="mt-1 text-xs font-medium">{s.heading}</p>
                    <p className="mt-1 text-[11px] text-foreground/70">{s.body}</p>
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-muted-foreground">Diperbarui {fmtDate(c.updatedAt)}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
