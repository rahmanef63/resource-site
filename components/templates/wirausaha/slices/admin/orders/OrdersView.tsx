"use client";

import { ShoppingCart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { SectionHead } from "@/components/templates/_shared/ui/section-head";
import { StatCard } from "@/components/templates/_shared/ui/stat-card";
import { rel, useBusinesses, useCustomers, useOrders } from "../../../shared/store";

export function OrdersView() {
  const orders = useOrders();
  const businesses = useBusinesses();
  const customers = useCustomers();
  const bizMap = new Map(businesses.map((b) => [b.id, b]));
  const custMap = new Map(customers.map((c) => [c.id, c]));
  const newOrders = orders.filter((o) => o.status === "new").length;
  const processing = orders.filter((o) => o.status === "processing").length;
  return (
    <div className="space-y-5">
      <SectionHead eyebrow="Order" title="Orders" subtitle="Status order dari new → processing → delivered." />
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard icon={ShoppingCart} label="Total order" value={orders.length} />
        <StatCard label="Order baru" value={newOrders} />
        <StatCard label="Diproses" value={processing} />
        <StatCard label="Selesai" value={orders.filter((o) => o.status === "delivered").length} />
      </div>

      <div className="grid gap-3">
        {orders.map((o) => (
          <Card key={o.id} className="border-border/60 bg-card/60">
            <CardContent className="space-y-2 p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="rounded-full text-[10px] capitalize">{o.status}</Badge>
                  <span className="font-mono text-[11px] text-muted-foreground">#{o.id.toUpperCase()}</span>
                </div>
                <span className="text-[11px] text-muted-foreground">{rel(o.ts)}</span>
              </div>
              <p className="text-sm">
                <span className="font-medium">{custMap.get(o.customerId)?.name ?? "—"}</span>
                <span className="text-muted-foreground"> di </span>
                <span>{bizMap.get(o.businessId)?.name ?? "—"}</span>
              </p>
              <p className="text-xs text-muted-foreground">{o.items.length} item · {o.totalLabel}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
