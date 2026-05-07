"use client";

import Link from "next/link";
import { Bot, FileText, Library, Quote, StickyNote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SectionHead } from "@/components/templates/_shared/ui/section-head";
import { StatCard } from "@/components/templates/_shared/ui/stat-card";
import { rel, useStore } from "../../../shared/store";
import { ADMIN_BASE } from "../../../shared/nav-config";

export function DashboardView() {
  const { state } = useStore();
  const indexed = state.documents.filter((d) => d.status !== "uploaded").length;
  const totalHighlights = state.documents.reduce((s, d) => s + d.highlights, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Selamat datang kembali</h1>
          <p className="text-sm text-muted-foreground">Ringkasan workspace riset Anda hari ini.</p>
        </div>
        <Button asChild size="sm">
          <Link href={`${ADMIN_BASE}/documents`}>Upload dokumen</Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard icon={FileText}   label="Dokumen" value={state.documents.length} hint={`${indexed} sudah terindeks`} href={`${ADMIN_BASE}/documents`} />
        <StatCard icon={StickyNote} label="Catatan" value={state.notes.length} hint="termasuk backlinks" href={`${ADMIN_BASE}/notes`} />
        <StatCard icon={Quote}      label="Citations" value={state.citations.length} hint="5 styles tersedia" href={`${ADMIN_BASE}/citations`} />
        <StatCard icon={Library}    label="Lit reviews" value={state.litReviews.length} hint="matrix komparasi" href={`${ADMIN_BASE}/lit-review`} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="border-border/60 bg-card/60 lg:col-span-2">
          <CardContent className="p-6">
            <SectionHead eyebrow="Aktivitas" title="Dokumen terbaru" align="left" />
            <ul className="divide-y divide-border/60">
              {state.documents.slice(0, 5).map((d) => (
                <li key={d.id} className="flex items-center gap-3 py-3 text-sm">
                  <FileText className="size-4 text-muted-foreground" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate">{d.title}</p>
                    <p className="text-[11px] text-muted-foreground">{d.authors} · {rel(d.uploadedAt)}</p>
                  </div>
                  <span className="rounded-full border px-2 py-0.5 text-[10px] capitalize">{d.status}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
        <Card className="border-border/60 bg-card/60">
          <CardContent className="p-6">
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground">AI assistant</p>
            <h3 className="mt-1 text-base font-medium">Total {totalHighlights} highlight</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {state.aiReaderSessions.length} sesi AI Reader sudah berjalan. Buka tab AI Reader untuk lanjut.
            </p>
            <Button asChild size="sm" className="mt-4 w-full gap-1">
              <Link href={`${ADMIN_BASE}/ai-reader`}><Bot className="size-4" /> Buka AI Reader</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
