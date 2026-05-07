"use client";

import * as React from "react";
import { BookOpen, FileText, Filter } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SectionHead } from "@/components/templates/_shared/ui/section-head";
import { fmtDate, useDocuments } from "../../shared/store";

export function LibraryPage() {
  const docs = useDocuments();
  const [q, setQ] = React.useState("");
  const filtered = React.useMemo(() => {
    const needle = q.toLowerCase().trim();
    if (!needle) return docs;
    return docs.filter(
      (d) =>
        d.title.toLowerCase().includes(needle) ||
        d.authors.toLowerCase().includes(needle) ||
        d.tag.toLowerCase().includes(needle),
    );
  }, [docs, q]);

  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <SectionHead
        eyebrow="Library"
        title="Knowledge base publik"
        subtitle="Paper, laporan, dan catatan riset yang sudah diindeks."
      />

      <div className="mb-6 flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[240px]">
          <Filter className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Cari judul, penulis, tag..."
            className="pl-8"
          />
        </div>
        <Badge variant="outline" className="rounded-full">{filtered.length} dokumen</Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {filtered.length === 0 && (
          <p className="col-span-full text-sm text-muted-foreground">Tidak ada dokumen yang cocok.</p>
        )}
        {filtered.map((d) => (
          <Card key={d.id} className="border-border/60 bg-card/60">
            <CardContent className="space-y-2 p-5">
              <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-muted-foreground">
                <BookOpen className="size-3" />
                <span>{d.year}</span>
                <Badge variant="outline" className="rounded-full text-[10px]">{d.tag}</Badge>
                <span>·</span>
                <span>{d.fileLabel}</span>
              </div>
              <h3 className="text-sm font-medium leading-snug">{d.title}</h3>
              <p className="text-xs text-muted-foreground">{d.authors}</p>
              <p className="line-clamp-3 text-xs text-foreground/70">{d.abstract}</p>
              <div className="flex items-center justify-between pt-2 text-[11px] text-muted-foreground">
                <span className="inline-flex items-center gap-1"><FileText className="size-3" /> {d.highlights} highlight</span>
                <span>Diunggah {fmtDate(d.uploadedAt)}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
