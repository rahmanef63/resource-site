"use client";

import * as React from "react";
import { Copy, Filter, Quote } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SectionHead } from "@/components/templates/_shared/ui/section-head";
import { fmtDate, useCitations } from "../../shared/store";
import { SEED_PUBLIC_CITATIONS_EXTRA } from "../../shared/publications-seed";
import type { CitationStyle } from "../../shared/types";

type Row = {
  id: string;
  style: CitationStyle;
  rendered: string;
  bibKey: string;
  addedAt: number;
};

const STYLES: (CitationStyle | "All")[] = ["All", "APA", "MLA", "Chicago", "IEEE", "BibTeX"];

function copyText(value: string, label: string) {
  navigator.clipboard
    .writeText(value)
    .then(() => toast.success(`${label} disalin.`))
    .catch(() => toast.error("Gagal menyalin."));
}

export function CitationsPage() {
  const workspaceCitations = useCitations();

  const rows: Row[] = React.useMemo(() => {
    const fromWorkspace: Row[] = workspaceCitations.map((c) => ({
      id: c.id,
      style: c.style,
      rendered: c.rendered,
      bibKey: c.bibKey,
      addedAt: c.addedAt,
    }));
    // Merge with extra public citations (deduped by bibKey).
    const seen = new Set(fromWorkspace.map((r) => r.bibKey));
    const extra: Row[] = SEED_PUBLIC_CITATIONS_EXTRA.filter((r) => !seen.has(r.bibKey)).map((r) => ({
      id: r.id,
      style: r.style,
      rendered: r.rendered,
      bibKey: r.bibKey,
      addedAt: r.addedAt,
    }));
    return [...fromWorkspace, ...extra].sort((a, b) => b.addedAt - a.addedAt);
  }, [workspaceCitations]);

  const [q, setQ] = React.useState("");
  const [style, setStyle] = React.useState<CitationStyle | "All">("All");

  const filtered = React.useMemo(() => {
    const needle = q.toLowerCase().trim();
    return rows.filter((r) => {
      if (style !== "All" && r.style !== style) return false;
      if (!needle) return true;
      return r.rendered.toLowerCase().includes(needle) || r.bibKey.toLowerCase().includes(needle);
    });
  }, [rows, style, q]);

  return (
    <section className="mx-auto max-w-5xl px-6 py-16">
      <SectionHead
        eyebrow="Citations"
        title="Direktori sitasi publik"
        subtitle="Daftar paper yang baru-baru ini disitir di workspace. Klik Copy untuk ambil format siap-tempel."
      />

      <div className="mb-6 flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[240px]">
          <Filter className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Cari penulis, judul, bibKey..."
            className="pl-8"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {STYLES.map((s) => (
            <Button
              key={s}
              type="button"
              variant={style === s ? "secondary" : "outline"}
              size="sm"
              onClick={() => setStyle(s)}
              className="h-7 rounded-full px-3 text-[11px] uppercase tracking-wider"
            >
              {s}
            </Button>
          ))}
        </div>
        <Badge variant="outline" className="rounded-full">{filtered.length}</Badge>
      </div>

      <div className="grid gap-3">
        {filtered.length === 0 && (
          <p className="text-sm text-muted-foreground">Belum ada sitasi yang cocok.</p>
        )}
        {filtered.map((r) => (
          <Card key={r.id} className="border-border/60 bg-card/60">
            <CardContent className="space-y-2 p-4">
              <div className="flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-wider text-muted-foreground">
                <Quote className="size-3" />
                <Badge variant="outline" className="rounded-full text-[10px]">{r.style}</Badge>
                <span className="font-mono normal-case tracking-normal">{r.bibKey}</span>
                <span>·</span>
                <span className="normal-case tracking-normal">Diadd {fmtDate(r.addedAt)}</span>
              </div>
              <p className="text-sm leading-relaxed text-foreground/85">{r.rendered}</p>
              <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 gap-1 text-xs"
                  onClick={() => copyText(r.rendered, r.style)}
                >
                  <Copy className="size-3" /> Copy {r.style}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 gap-1 text-xs"
                  onClick={() => copyText(r.bibKey, "bibKey")}
                >
                  <Copy className="size-3" /> bibKey
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
