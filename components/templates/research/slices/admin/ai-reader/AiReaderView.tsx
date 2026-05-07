"use client";

import { Bot, FileText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { SectionHead } from "@/components/templates/_shared/ui/section-head";
import { StatCard } from "@/components/templates/_shared/ui/stat-card";
import { rel, useAiReaderSessions, useDocuments } from "../../../shared/store";

export function AiReaderView() {
  const sessions = useAiReaderSessions();
  const docs = useDocuments();
  const docMap = new Map(docs.map((d) => [d.id, d]));
  return (
    <div className="space-y-5">
      <SectionHead
        eyebrow="AI Reader"
        title="Chat dengan dokumen"
        subtitle="Tanya, parafrase, ringkas — AI selalu balik ke source-of-truth."
      />
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard icon={Bot} label="Total sesi" value={sessions.length} />
        <StatCard icon={FileText} label="Dokumen siap" value={docs.filter((d) => d.status !== "uploaded").length} />
        <StatCard label="Mode" value="EYD" hint="Bahasa akademik Indonesia" />
      </div>

      <div className="space-y-3">
        {sessions.map((s) => {
          const doc = docMap.get(s.docId);
          return (
            <Card key={s.id} className="border-border/60 bg-card/60">
              <CardContent className="space-y-3 p-5">
                <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider text-muted-foreground">
                  <FileText className="size-3" />
                  <span className="truncate">{doc?.title ?? s.docId}</span>
                  <span>·</span>
                  <span>{rel(s.ts)}</span>
                </div>
                <div className="rounded-md border border-border/60 bg-muted/30 p-3 text-sm">
                  <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Tanya</p>
                  <p className="mt-1">{s.question}</p>
                </div>
                <div className="rounded-md border border-border/60 bg-card p-3 text-sm">
                  <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Jawaban AI</p>
                  <p className="mt-1 text-foreground/85">{s.answer}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
