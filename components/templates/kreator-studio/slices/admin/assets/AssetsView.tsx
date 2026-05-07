"use client";

import { Image as ImageIcon, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SectionHead } from "@/components/templates/_shared/ui/section-head";
import { StatCard } from "@/components/templates/_shared/ui/stat-card";
import { fmtDate, useAssets } from "../../../shared/store";

export function AssetsView() {
  const assets = useAssets();
  const photos = assets.filter((a) => a.kind === "photo").length;
  const videos = assets.filter((a) => a.kind === "video").length;
  return (
    <div className="space-y-5">
      <SectionHead
        eyebrow="Assets"
        title="Media Library"
        subtitle="B-roll, headshot, logo, audio — semua aset siap pakai."
      />
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard icon={ImageIcon} label="Total aset" value={assets.length} />
        <StatCard label="Foto" value={photos} />
        <StatCard label="Video" value={videos} />
        <StatCard label="Lainnya" value={assets.length - photos - videos} />
      </div>

      <div className="flex justify-end">
        <Button size="sm" className="gap-1"><Plus className="size-4" /> Upload aset</Button>
      </div>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {assets.map((a) => (
          <Card key={a.id} className="border-border/60 bg-card/60">
            <CardContent className="space-y-2 p-4">
              <Badge variant="outline" className="rounded-full text-[10px] capitalize">{a.kind}</Badge>
              <p className="text-sm font-medium">{a.title}</p>
              <p className="text-[11px] text-muted-foreground">{a.fileLabel} · {fmtDate(a.uploadedAt)}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
