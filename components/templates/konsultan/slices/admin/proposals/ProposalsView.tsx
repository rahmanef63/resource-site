"use client";

import { FileText, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SectionHead } from "@/components/templates/_shared/ui/section-head";
import { StatCard } from "@/components/templates/_shared/ui/stat-card";
import { fmtDate, useClients, useProposals } from "../../../shared/store";

export function ProposalsView() {
  const proposals = useProposals();
  const clients = useClients();
  const cmap = new Map(clients.map((c) => [c.id, c]));
  const accepted = proposals.filter((p) => p.status === "accepted").length;
  const sent = proposals.filter((p) => p.status === "sent").length;
  return (
    <div className="space-y-5">
      <SectionHead
        eyebrow="Proposals"
        title="Proposal Manager"
        subtitle="Generate proposal AI dari brief — siap dipresentasikan."
      />
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard icon={FileText} label="Total proposal" value={proposals.length} />
        <StatCard label="Diterima" value={accepted} />
        <StatCard label="Menunggu" value={sent} />
      </div>

      <div className="flex justify-end gap-2">
        <Button size="sm" variant="outline">Generate AI</Button>
        <Button size="sm" className="gap-1"><Plus className="size-4" /> Manual baru</Button>
      </div>

      <div className="grid gap-3">
        {proposals.map((p) => (
          <Card key={p.id} className="border-border/60 bg-card/60">
            <CardContent className="space-y-2 p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="rounded-full text-[10px] capitalize">{p.status}</Badge>
                  <span className="text-[11px] text-muted-foreground">{cmap.get(p.clientId)?.company ?? "—"}</span>
                </div>
                <span className="text-[11px] text-muted-foreground">{fmtDate(p.createdAt)}</span>
              </div>
              <p className="text-sm font-medium">{p.title}</p>
              <p className="text-xs text-muted-foreground">{p.scope}</p>
              <div className="flex gap-3 pt-1 text-[11px] text-muted-foreground">
                <span><strong>Nilai:</strong> {p.valueLabel}</span>
                <span><strong>Durasi:</strong> {p.durationLabel}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
