"use client";

import Link from "next/link";
import { Briefcase, FileText, Receipt, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SectionHead } from "@/components/templates/_shared/ui/section-head";
import { StatCard } from "@/components/templates/_shared/ui/stat-card";
import { rel, useStore } from "../../../shared/store";
import { ADMIN_BASE } from "../../../shared/nav-config";

export function DashboardView() {
  const { state } = useStore();
  const activeClients = state.clients.filter((c) => c.status === "active").length;
  const newLeads = state.clients.filter((c) => c.status === "lead").length;
  const activeProjects = state.projects.filter((p) => p.status !== "delivered").length;
  const unpaidInvoices = state.invoices.filter((i) => i.status === "sent" || i.status === "overdue").length;
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard Konsultan</h1>
          <p className="text-sm text-muted-foreground">
            {newLeads > 0
              ? `${newLeads} lead baru menunggu proposal · ${unpaidInvoices} invoice belum lunas`
              : "Semua lead diproses · semua invoice tertangani"}
          </p>
        </div>
        <Button asChild size="sm">
          <Link href={`${ADMIN_BASE}/proposals`}>Buat proposal baru</Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard icon={Users}     label="Client aktif"   value={activeClients} hint={`${state.clients.length} total`} href={`${ADMIN_BASE}/clients`} />
        <StatCard icon={FileText}  label="Proposal aktif" value={state.proposals.filter((p) => p.status !== "rejected").length} href={`${ADMIN_BASE}/proposals`} />
        <StatCard icon={Briefcase} label="Project aktif"  value={activeProjects} href={`${ADMIN_BASE}/projects`} />
        <StatCard icon={Receipt}   label="Invoice unpaid" value={unpaidInvoices} hint="termasuk overdue" href={`${ADMIN_BASE}/billing`} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="border-border/60 bg-card/60 lg:col-span-2">
          <CardContent className="p-6">
            <SectionHead eyebrow="Project" title="Project terbaru" align="left" />
            <ul className="divide-y divide-border/60">
              {state.projects.map((p) => (
                <li key={p.id} className="flex items-center gap-3 py-3 text-sm">
                  <Briefcase className="size-4 text-muted-foreground" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate">{p.name}</p>
                    <p className="text-[11px] text-muted-foreground">{p.progress}% · started {rel(p.startedAt)}</p>
                  </div>
                  <span className="rounded-full border px-2 py-0.5 text-[10px] capitalize">{p.status}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
        <Card className="border-border/60 bg-card/60">
          <CardContent className="p-6">
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground">AI Proposal</p>
            <h3 className="mt-1 text-base font-medium">Generate proposal cepat</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Brief 1 paragraf → proposal lengkap dengan scope, timeline, dan pricing.
            </p>
            <Button asChild size="sm" className="mt-4 w-full">
              <Link href={`${ADMIN_BASE}/proposals`}>Buka proposals</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
