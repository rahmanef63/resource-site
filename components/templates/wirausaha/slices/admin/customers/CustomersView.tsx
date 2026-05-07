"use client";

import { Plus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SectionHead } from "@/components/templates/_shared/ui/section-head";
import { StatCard } from "@/components/templates/_shared/ui/stat-card";
import { useCustomers } from "../../../shared/store";

export function CustomersView() {
  const customers = useCustomers();
  const totalOrders = customers.reduce((s, c) => s + c.orderCount, 0);
  return (
    <div className="space-y-5">
      <SectionHead eyebrow="Customers" title="Customers" subtitle="Profil pelanggan lintas unit usaha." />
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard icon={Users} label="Total pelanggan" value={customers.length} />
        <StatCard label="Total order" value={totalOrders} />
        <StatCard label="Avg order/cust" value={customers.length ? Math.round(totalOrders / customers.length) : 0} />
      </div>

      <div className="flex justify-end">
        <Button size="sm" className="gap-1"><Plus className="size-4" /> Pelanggan baru</Button>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {customers.map((c) => (
          <Card key={c.id} className="border-border/60 bg-card/60">
            <CardContent className="space-y-1 p-5">
              <p className="text-sm font-medium">{c.name}</p>
              <p className="text-xs text-muted-foreground">{c.phone} · {c.city}</p>
              <div className="flex items-center justify-between pt-2">
                <p className="text-base font-semibold">{c.totalSpentLabel}</p>
                <p className="text-[11px] text-muted-foreground">{c.orderCount} order</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
