"use client";

import { Plus, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SectionHead } from "@/components/templates/_shared/ui/section-head";
import { StatCard } from "@/components/templates/_shared/ui/stat-card";
import { fmtDate, useClients } from "../../../shared/store";

export function ClientsView() {
  const clients = useClients();
  const active = clients.filter((c) => c.status === "active").length;
  const leads = clients.filter((c) => c.status === "lead").length;
  return (
    <div className="space-y-5">
      <SectionHead eyebrow="CRM" title="Clients" subtitle="Kelola lead, klien aktif, dan engagement selesai." />
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard icon={Users} label="Total client" value={clients.length} />
        <StatCard label="Aktif" value={active} />
        <StatCard label="Lead baru" value={leads} />
      </div>

      <div className="flex justify-end">
        <Button size="sm" className="gap-1"><Plus className="size-4" /> Client baru</Button>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {clients.map((c) => (
          <Card key={c.id} className="border-border/60 bg-card/60">
            <CardContent className="space-y-1 p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">{c.name}</p>
                <Badge variant="outline" className="rounded-full text-[10px] capitalize">{c.status}</Badge>
              </div>
              <p className="text-xs text-muted-foreground">{c.company} · {c.industry}</p>
              <p className="text-[11px] text-muted-foreground">{c.email} · {c.phone}</p>
              <p className="text-[11px] text-muted-foreground">{c.city} · sejak {fmtDate(c.createdAt)}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
