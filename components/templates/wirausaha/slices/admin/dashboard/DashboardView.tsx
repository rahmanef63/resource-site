"use client";

import Link from "next/link";
import { Building2, Package, ShoppingCart, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SectionHead } from "@/components/templates/_shared/ui/section-head";
import { StatCard } from "@/components/templates/_shared/ui/stat-card";
import { rel, useStore } from "../../../shared/store";
import { ADMIN_BASE } from "../../../shared/nav-config";

export function DashboardView() {
  const { state } = useStore();
  const newOrders = state.orders.filter((o) => o.status === "new").length;
  const lowStock = state.products.filter((p) => p.stock < 20).length;
  const totalRevenue = state.businesses.reduce((s, b) => s + b.monthlyRevenue, 0);
  const incomeToday = state.finance.filter((f) => f.kind === "income").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard Wirausaha</h1>
          <p className="text-sm text-muted-foreground">
            {newOrders > 0
              ? `${newOrders} order baru menunggu proses · ${lowStock} produk stok menipis`
              : "Semua order tertangani · stok aman"}
          </p>
        </div>
        <Button asChild size="sm">
          <Link href={`${ADMIN_BASE}/orders`}>Lihat orders</Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard icon={Building2}    label="Unit usaha" value={state.businesses.length} hint="aktif" href={`${ADMIN_BASE}/businesses`} />
        <StatCard icon={Wallet}       label="Revenue bulanan" value={`Rp ${(totalRevenue / 1_000_000).toFixed(1)}jt`} hint="total" />
        <StatCard icon={ShoppingCart} label="Order baru" value={newOrders} href={`${ADMIN_BASE}/orders`} />
        <StatCard icon={Package}      label="Stok menipis" value={lowStock} hint="produk &lt; 20 unit" href={`${ADMIN_BASE}/inventory`} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="border-border/60 bg-card/60 lg:col-span-2">
          <CardContent className="p-6">
            <SectionHead eyebrow="Order" title="Order terbaru" align="left" />
            <ul className="divide-y divide-border/60">
              {state.orders.slice(0, 5).map((o) => (
                <li key={o.id} className="flex items-center gap-3 py-3 text-sm">
                  <ShoppingCart className="size-4 text-muted-foreground" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate">Order {o.id.toUpperCase()} · {o.totalLabel}</p>
                    <p className="text-[11px] text-muted-foreground">{o.items.length} item · {rel(o.ts)}</p>
                  </div>
                  <span className="rounded-full border px-2 py-0.5 text-[10px] capitalize">{o.status}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
        <Card className="border-border/60 bg-card/60">
          <CardContent className="p-6">
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground">AI laporan</p>
            <h3 className="mt-1 text-base font-medium">Narasi laporan bulanan</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {incomeToday} catatan income hari ini. Generate ringkasan otomatis dalam bahasa Indonesia.
            </p>
            <Button asChild size="sm" className="mt-4 w-full">
              <Link href={`${ADMIN_BASE}/finance`}>Buka finance</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
