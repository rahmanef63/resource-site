"use client";

import Link from "next/link";
import { ArrowRight, CreditCard, Inbox, Users, Megaphone } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { fmtDate, useStore } from "../../../shared/store";
import { ADMIN_BASE } from "../../../shared/nav-config";

export function DashboardView() {
  const { state } = useStore();
  const activeCustomers = state.customers.filter((c) => c.status === "active");
  const activeSubs = state.subscriptions.filter((s) => s.status === "active");
  const newLeads = state.leads.filter((l) => l.status === "new");
  const mrrCents = activeSubs.reduce((acc, s) => acc + s.mrrCents, 0);
  const mrr = `$${(mrrCents / 100).toFixed(0)}`;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Growth dashboard</h1>
        <p className="text-sm text-muted-foreground">{fmtDate(Date.now())}</p>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        <Stat icon={Users}      label="Active customers" v={String(activeCustomers.length)} href={`${ADMIN_BASE}/customers`} />
        <Stat icon={CreditCard} label="MRR"              v={mrr}                            href={`${ADMIN_BASE}/subscriptions`} />
        <Stat icon={Inbox}      label="New leads"        v={String(newLeads.length)}        href={`${ADMIN_BASE}/leads`} />
        <Stat icon={Megaphone}  label="Changelog"        v={String(state.changelog.length)} href={`${ADMIN_BASE}/changelog`} />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-border/60">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-medium">Recent leads</h2>
              <Link href={`${ADMIN_BASE}/leads`} className="text-xs text-muted-foreground hover:text-foreground">All <ArrowRight className="ml-1 inline size-3" /></Link>
            </div>
            <ul className="mt-4 space-y-3">
              {state.leads.slice(0, 5).map((l) => (
                <li key={l.id} className="flex items-center gap-3 text-sm">
                  <Badge variant={l.status === "new" ? "default" : "outline"} className="text-[10px]">{l.status}</Badge>
                  <span className="flex-1 truncate">{l.name}</span>
                  <span className="text-xs text-muted-foreground">{l.source}</span>
                </li>
              ))}
              {state.leads.length === 0 && <li className="text-sm text-muted-foreground">No leads yet.</li>}
            </ul>
          </CardContent>
        </Card>
        <Card className="border-border/60">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-medium">Latest posts</h2>
              <Link href={`${ADMIN_BASE}/posts`} className="text-xs text-muted-foreground hover:text-foreground">All <ArrowRight className="ml-1 inline size-3" /></Link>
            </div>
            <ul className="mt-4 space-y-3">
              {state.posts.slice(0, 5).map((p) => (
                <li key={p.id} className="flex items-center gap-3 text-sm">
                  <Badge variant={p.status === "draft" ? "secondary" : "outline"} className="text-[10px]">{p.status ?? "published"}</Badge>
                  <span className="flex-1 truncate">{p.title}</span>
                  <span className="text-xs text-muted-foreground">{p.author}</span>
                </li>
              ))}
              {state.posts.length === 0 && <li className="text-sm text-muted-foreground">No posts yet.</li>}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Stat({ icon: Icon, label, v, href }: { icon: any; label: string; v: string; href: string }) {
  return (
    <Link href={href} className="group rounded-lg border border-border/60 bg-card p-4 transition hover:bg-accent/40">
      <div className="flex items-center gap-2 text-xs text-muted-foreground"><Icon className="size-3.5" /> {label}</div>
      <p className="mt-2 text-2xl font-semibold tracking-tight">{v}</p>
    </Link>
  );
}
