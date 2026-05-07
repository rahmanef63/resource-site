"use client";

import { FileText, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SectionHead } from "@/components/templates/_shared/ui/section-head";
import { StatCard } from "@/components/templates/_shared/ui/stat-card";
import { fmtDate, useDocuments } from "../../../shared/store";

export function DocumentsView() {
  const docs = useDocuments();
  const indexed = docs.filter((d) => d.status === "indexed").length;
  const reviewed = docs.filter((d) => d.status === "reviewed").length;
  const totalPages = docs.reduce((s, d) => s + d.pages, 0);
  return (
    <div className="space-y-5">
      <SectionHead
        eyebrow="Library"
        title="Documents"
        subtitle="Upload PDF/DOCX, OCR otomatis, indeks vektor untuk pencarian semantik."
        cta={{ label: "Upload baru", href: "#" }}
      />
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard icon={FileText} label="Total dokumen" value={docs.length} />
        <StatCard label="Sudah diindeks" value={indexed} />
        <StatCard label="Sudah direview" value={reviewed} />
        <StatCard label="Total halaman" value={totalPages} />
      </div>

      <div className="flex justify-end">
        <Button size="sm" className="gap-1"><Plus className="size-4" /> Upload dokumen</Button>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {docs.map((d) => (
          <Card key={d.id} className="border-border/60 bg-card/60">
            <CardContent className="space-y-2 p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">{d.title}</p>
                <Badge variant="outline" className="rounded-full text-[10px] capitalize">{d.status}</Badge>
              </div>
              <p className="text-xs text-muted-foreground">{d.authors} · {d.year}</p>
              <p className="line-clamp-2 text-xs text-foreground/70">{d.abstract}</p>
              <div className="flex items-center justify-between pt-2 text-[11px] text-muted-foreground">
                <span>{d.fileLabel} · {d.highlights} highlight</span>
                <span>{fmtDate(d.uploadedAt)}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
