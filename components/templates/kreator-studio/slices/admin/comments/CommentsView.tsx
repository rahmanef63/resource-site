"use client";

import { MessageSquare } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { SectionHead } from "@/components/templates/_shared/ui/section-head";
import { StatCard } from "@/components/templates/_shared/ui/stat-card";
import { rel, useCommentDrafts } from "../../../shared/store";

export function CommentsView() {
  const drafts = useCommentDrafts();
  const pending = drafts.filter((d) => d.status === "draft").length;
  return (
    <div className="space-y-5">
      <SectionHead
        eyebrow="Comments"
        title="Reply Drafts"
        subtitle="AI bantu draft balasan — kamu tinggal review dan kirim."
      />
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard icon={MessageSquare} label="Total drafts" value={drafts.length} />
        <StatCard label="Menunggu kirim" value={pending} />
        <StatCard label="Sudah dibalas" value={drafts.length - pending} />
      </div>

      <div className="grid gap-3">
        {drafts.map((d) => (
          <Card key={d.id} className="border-border/60 bg-card/60">
            <CardContent className="space-y-3 p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="rounded-full text-[10px] capitalize">{d.channel}</Badge>
                  <span className="truncate text-[11px] text-muted-foreground">{d.postRef}</span>
                </div>
                <span className="text-[11px] text-muted-foreground">{rel(d.ts)}</span>
              </div>
              <div className="rounded-md border border-border/60 bg-muted/30 p-3 text-sm">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Comment</p>
                <p className="mt-1">{d.comment}</p>
              </div>
              <div className="rounded-md border border-border/60 bg-card p-3 text-sm">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Draft balasan ({d.status})</p>
                <p className="mt-1 text-foreground/85">{d.reply}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
