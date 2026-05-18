"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { rel, useStore } from "../../../shared/store";
import type { LeadStatus } from "../../../shared/types";

const STATUS_VARIANT: Record<LeadStatus, "default" | "secondary" | "outline" | "destructive"> = {
  new: "default",
  contacted: "secondary",
  qualified: "secondary",
  won: "outline",
  lost: "destructive",
};

const STATUSES: LeadStatus[] = ["new", "contacted", "qualified", "won", "lost"];

export function LeadsView() {
  const { state } = useStore();
  const counts = STATUSES.reduce<Record<LeadStatus, number>>((acc, s) => {
    acc[s] = state.leads.filter((l) => l.status === s).length;
    return acc;
  }, { new: 0, contacted: 0, qualified: 0, won: 0, lost: 0 });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Leads</h1>
        <p className="text-sm text-muted-foreground">{state.leads.length} total — pipeline below.</p>
      </div>

      <div className="grid gap-2 md:grid-cols-5">
        {STATUSES.map((s) => (
          <Card key={s} className="border-border/60">
            <CardContent className="p-3">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{s}</p>
              <p className="text-2xl font-semibold tracking-tight">{counts[s]}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-border/60">
        <CardContent className="p-0">
          <ul className="divide-y divide-border/60">
            {state.leads.map((l) => (
              <li key={l.id} className="grid grid-cols-1 gap-1 px-5 py-4 text-sm md:grid-cols-12 md:items-center">
                <p className="font-medium md:col-span-3">{l.name}</p>
                <p className="text-muted-foreground md:col-span-4">{l.email}</p>
                <Badge variant="outline" className="w-fit md:col-span-2">{l.source}</Badge>
                <Badge variant={STATUS_VARIANT[l.status]} className="w-fit md:col-span-1">{l.status}</Badge>
                <p className="text-xs text-muted-foreground md:col-span-2 md:text-right">{rel(l.ts)}</p>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
