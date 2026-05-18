"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { fmtDate, useStore } from "../../../shared/store";
import type { CustomerStatus } from "../../../shared/types";

const STATUS_VARIANT: Record<CustomerStatus, "default" | "secondary" | "outline"> = {
  active: "default",
  trial: "secondary",
  churned: "outline",
};

export function CustomersView() {
  const { state } = useStore();
  const active = state.customers.filter((c) => c.status === "active").length;
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Customers</h1>
        <p className="text-sm text-muted-foreground">{state.customers.length} total · {active} active</p>
      </div>
      <Card className="border-border/60">
        <CardContent className="p-0">
          <ul className="divide-y divide-border/60">
            {state.customers.map((c) => (
              <li key={c.id} className="grid grid-cols-1 gap-1 px-5 py-4 text-sm md:grid-cols-12 md:items-center">
                <p className="font-medium md:col-span-3">{c.name}</p>
                <p className="text-muted-foreground md:col-span-4">{c.email}</p>
                <Badge variant="outline" className="w-fit md:col-span-2">{c.plan}</Badge>
                <Badge variant={STATUS_VARIANT[c.status]} className="w-fit md:col-span-1">{c.status}</Badge>
                <p className="text-xs text-muted-foreground md:col-span-2">since {fmtDate(c.startedAt)}</p>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
