"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { fmtDate, useStore } from "../../../shared/store";

export function ClientsList() {
  const { state } = useStore();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Clients</h1>
        <p className="text-sm text-muted-foreground">{state.clients.length} total · {state.clients.filter((c) => c.status === "active").length} active</p>
      </div>
      <Card className="border-border/60">
        <CardContent className="p-0">
          <ul className="divide-y divide-border/60">
            {state.clients.map((c) => (
              <li key={c.id} className="grid grid-cols-1 gap-1 px-5 py-4 text-sm md:grid-cols-12 md:items-center">
                <p className="font-medium md:col-span-3">{c.name}</p>
                <p className="text-muted-foreground md:col-span-2">{c.industry}</p>
                <p className="md:col-span-3">{c.contact} <span className="text-xs text-muted-foreground">· {c.email}</span></p>
                <Badge variant={c.status === "active" ? "default" : c.status === "alumni" ? "secondary" : "outline"} className="w-fit md:col-span-1">{c.status}</Badge>
                <p className="text-xs text-muted-foreground md:col-span-3">since {fmtDate(c.startedAt)} — {c.notes}</p>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
