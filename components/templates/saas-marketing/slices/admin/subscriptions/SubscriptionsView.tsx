"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { fmtDate, useStore } from "../../../shared/store";
import type { SubStatus } from "../../../shared/types";

const STATUS_VARIANT: Record<SubStatus, "default" | "secondary" | "outline" | "destructive"> = {
  active: "default",
  trialing: "secondary",
  past_due: "destructive",
  canceled: "outline",
};

const fmtMrr = (cents: number) => `$${(cents / 100).toFixed(0)}/mo`;

export function SubscriptionsView() {
  const { state } = useStore();
  const active = state.subscriptions.filter((s) => s.status === "active");
  const mrrCents = active.reduce((acc, s) => acc + s.mrrCents, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Subscriptions</h1>
        <p className="text-sm text-muted-foreground">
          {state.subscriptions.length} total · {active.length} active · MRR ${(mrrCents / 100).toFixed(0)}
        </p>
      </div>
      <Card className="border-border/60">
        <CardContent className="p-0">
          <ul className="divide-y divide-border/60">
            {state.subscriptions.map((s) => (
              <li key={s.id} className="grid grid-cols-1 gap-1 px-5 py-4 text-sm md:grid-cols-12 md:items-center">
                <p className="font-medium md:col-span-4">{s.customerEmail}</p>
                <Badge variant="outline" className="w-fit md:col-span-2">{s.plan}</Badge>
                <p className="md:col-span-2">{fmtMrr(s.mrrCents)}</p>
                <Badge variant={STATUS_VARIANT[s.status]} className="w-fit md:col-span-2">{s.status}</Badge>
                <p className="text-xs text-muted-foreground md:col-span-2">renews {fmtDate(s.renewsAt)}</p>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
