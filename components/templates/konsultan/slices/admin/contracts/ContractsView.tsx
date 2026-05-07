"use client";

import { FileSignature, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SectionHead } from "@/components/templates/_shared/ui/section-head";
import { StatCard } from "@/components/templates/_shared/ui/stat-card";
import { fmtDate, useClients, useContracts } from "../../../shared/store";

export function ContractsView() {
  const contracts = useContracts();
  const clients = useClients();
  const cmap = new Map(clients.map((c) => [c.id, c]));
  const signed = contracts.filter((c) => c.status === "signed").length;
  return (
    <div className="space-y-5">
      <SectionHead
        eyebrow="Contracts"
        title="Kontrak ID-aware"
        subtitle="Template kontrak sesuai hukum Indonesia — bilingual ID/EN."
      />
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard icon={FileSignature} label="Total kontrak" value={contracts.length} />
        <StatCard label="Aktif" value={signed} />
        <StatCard label="Expired" value={contracts.filter((c) => c.status === "expired").length} />
      </div>

      <div className="flex justify-end">
        <Button size="sm" className="gap-1"><Plus className="size-4" /> Kontrak baru</Button>
      </div>

      <div className="grid gap-3">
        {contracts.map((c) => (
          <Card key={c.id} className="border-border/60 bg-card/60">
            <CardContent className="space-y-2 p-5">
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="rounded-full text-[10px] capitalize">{c.status}</Badge>
                <span className="text-[11px] text-muted-foreground">
                  Signed {fmtDate(c.signedAt)} · ends {fmtDate(c.endsAt)}
                </span>
              </div>
              <p className="text-sm font-medium">{c.title}</p>
              <p className="text-xs text-muted-foreground">Klien: {cmap.get(c.clientId)?.company ?? "—"}</p>
              <p className="text-xs text-foreground/70">{c.termsSummary}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
