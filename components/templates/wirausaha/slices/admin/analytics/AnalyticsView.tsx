"use client";

import * as React from "react";
import { TrendingUp, TrendingDown, ShoppingBag, Wallet, Users, Trophy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useStore } from "../../../shared/store";

/**
 * Analytics dashboard untuk Wirausaha OS. KPI utama (orders/AOV/top SKU/LTV)
 * + tabel best-seller + sparkline 7 hari. Pure read dari state — tidak ada
 * action dispatch.
 */
export function AnalyticsView() {
  const { state } = useStore();

  // KPI primitives
  const dailyOrders = state.orders.length; // demo: total === daily
  const totalRevenue = state.finance
    .filter((f) => f.kind === "income")
    .reduce((s, f) => s + parseRupiah(f.amountLabel), 0);
  const aov = dailyOrders ? Math.round(totalRevenue / dailyOrders) : 0;
  const ltvAvg = state.customers.length
    ? Math.round(
        state.customers.reduce((s, c) => s + parseRupiah(c.totalSpentLabel), 0) /
          state.customers.length,
      )
    : 0;

  // Top SKU = produk dengan order qty tertinggi (gabungkan items semua orders)
  const skuQty = new Map<string, number>();
  state.orders.forEach((o) =>
    o.items.forEach((it) => skuQty.set(it.productId, (skuQty.get(it.productId) ?? 0) + it.qty)),
  );
  const bestSellers = state.products
    .map((p) => ({ ...p, qty: skuQty.get(p.id) ?? 0 }))
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 6);
  const topSku = bestSellers[0];

  // Sparkline: orders per hari (last 7) — demo distribusi acak deterministik
  const weekly = React.useMemo(() => {
    const days = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];
    return days.map((d, i) => ({ day: d, value: 30 + ((dailyOrders * (i + 3)) % 70) }));
  }, [dailyOrders]);
  const maxWeekly = Math.max(...weekly.map((w) => w.value), 1);

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Analytics</h1>
          <p className="text-sm text-muted-foreground">Ringkasan kinerja multi-unit, agregat 30 hari terakhir.</p>
        </div>
        <Badge variant="outline" className="rounded-full">30 hari terakhir</Badge>
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        <KpiCard label="Order harian" value={dailyOrders.toString()} icon={ShoppingBag} delta="+12%" up />
        <KpiCard label="AOV" value={formatRupiah(aov)} icon={Wallet} delta="+4%" up />
        <KpiCard label="Top SKU" value={topSku?.name ?? "—"} icon={Trophy} delta={topSku ? `${topSku.qty} unit` : "—"} />
        <KpiCard label="LTV rata-rata" value={formatRupiah(ltvAvg)} icon={Users} delta="-2%" />
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <Card className="border-border/60 bg-card/60">
          <CardContent className="p-5">
            <p className="mb-3 text-[11px] uppercase tracking-wider text-muted-foreground">
              Best-seller bulan ini
            </p>
            <ul className="space-y-2">
              {bestSellers.map((p, i) => (
                <li key={p.id} className="flex items-center gap-3">
                  <span className="grid size-5 place-items-center rounded-full bg-muted text-[10px]">
                    {i + 1}
                  </span>
                  <div className="flex-1 truncate">
                    <p className="truncate text-sm">{p.name}</p>
                    <p className="truncate text-[11px] text-muted-foreground">{p.sku} · {p.priceLabel}</p>
                  </div>
                  <span className="font-mono text-xs text-muted-foreground">{p.qty} unit</span>
                </li>
              ))}
              {bestSellers.length === 0 && (
                <li className="text-sm text-muted-foreground">Belum ada data order.</li>
              )}
            </ul>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/60">
          <CardContent className="p-5">
            <p className="mb-3 text-[11px] uppercase tracking-wider text-muted-foreground">
              Order per hari (7 hari)
            </p>
            <div className="flex h-32 items-end gap-2">
              {weekly.map((w) => (
                <div key={w.day} className="flex flex-1 flex-col items-center gap-1">
                  <div
                    className="w-full rounded-t bg-gradient-to-t from-emerald-500/70 to-emerald-400"
                    style={{ height: `${(w.value / maxWeekly) * 100}%` }}
                    aria-label={`${w.day}: ${w.value} order`}
                  />
                  <span className="text-[10px] uppercase text-muted-foreground">{w.day}</span>
                </div>
              ))}
            </div>
            <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
              <TrendingUp className="size-3 text-emerald-400" />
              <span>Tren naik {Math.round(((weekly[6].value - weekly[0].value) / weekly[0].value) * 100)}% week-over-week</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function KpiCard({
  label, value, icon: Icon, delta, up,
}: { label: string; value: string; icon: React.ComponentType<{ className?: string }>; delta?: string; up?: boolean }) {
  return (
    <Card className="border-border/60 bg-card/60">
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
          <Icon className="size-3.5 text-muted-foreground" />
        </div>
        <p className="mt-2 truncate text-xl font-semibold tracking-tight">{value}</p>
        {delta && (
          <p className={`mt-1 flex items-center gap-1 text-[11px] ${up ? "text-emerald-400" : "text-muted-foreground"}`}>
            {up ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
            {delta}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

/** Parse "Rp 1.2jt" / "Rp 240k" / "Rp 14k" → number rupiah. Best-effort. */
function parseRupiah(label: string): number {
  const cleaned = label.replace(/Rp|\s|\./g, "").toLowerCase();
  const m = cleaned.match(/^([0-9.,]+)(jt|k|m)?/);
  if (!m) return 0;
  const num = Number(m[1].replace(",", "."));
  if (Number.isNaN(num)) return 0;
  if (m[2] === "jt" || m[2] === "m") return Math.round(num * 1_000_000);
  if (m[2] === "k") return Math.round(num * 1_000);
  return Math.round(num);
}

function formatRupiah(n: number): string {
  if (n >= 1_000_000) return `Rp ${(n / 1_000_000).toFixed(1)}jt`;
  if (n >= 1_000) return `Rp ${Math.round(n / 1_000)}k`;
  return `Rp ${n}`;
}
