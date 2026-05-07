"use client";

import { Library, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SectionHead } from "@/components/templates/_shared/ui/section-head";
import { StatCard } from "@/components/templates/_shared/ui/stat-card";
import { fmtDate, useDocuments, useLitReviews } from "../../../shared/store";

export function LitReviewView() {
  const reviews = useLitReviews();
  const docs = useDocuments();
  const docMap = new Map(docs.map((d) => [d.id, d]));
  const totalEntries = reviews.reduce((s, r) => s + r.matrix.length, 0);
  return (
    <div className="space-y-5">
      <SectionHead
        eyebrow="Sintesis"
        title="Literature Review"
        subtitle="Matrix bandingkan metode, temuan, dan gap antar paper."
      />
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard icon={Library} label="Total review" value={reviews.length} />
        <StatCard label="Entri matrix" value={totalEntries} />
        <StatCard label="Dokumen sumber" value={docs.length} />
      </div>

      <div className="flex justify-end">
        <Button size="sm" className="gap-1"><Plus className="size-4" /> Review baru</Button>
      </div>

      <div className="space-y-4">
        {reviews.map((r) => (
          <Card key={r.id} className="border-border/60 bg-card/60">
            <CardContent className="space-y-3 p-5">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Topik</p>
                <h3 className="mt-1 text-base font-medium">{r.topic}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{r.question}</p>
              </div>
              <div className="overflow-hidden rounded-md border border-border/60">
                <table className="w-full text-xs">
                  <thead className="bg-muted/40 text-left">
                    <tr>
                      <th className="px-3 py-2">Paper</th>
                      <th className="px-3 py-2">Metode</th>
                      <th className="px-3 py-2">Temuan</th>
                      <th className="px-3 py-2">Gap</th>
                    </tr>
                  </thead>
                  <tbody>
                    {r.matrix.map((row, i) => (
                      <tr key={i} className="border-t border-border/60 align-top">
                        <td className="px-3 py-2 font-medium">{docMap.get(row.docId)?.title.slice(0, 30) ?? row.docId}…</td>
                        <td className="px-3 py-2 text-muted-foreground">{row.method}</td>
                        <td className="px-3 py-2 text-muted-foreground">{row.finding}</td>
                        <td className="px-3 py-2 text-muted-foreground">{row.gap}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-[11px] text-muted-foreground">Diperbarui {fmtDate(r.updatedAt)}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
