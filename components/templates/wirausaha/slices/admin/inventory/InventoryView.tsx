"use client";

import { Package, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SectionHead } from "@/components/templates/_shared/ui/section-head";
import { StatCard } from "@/components/templates/_shared/ui/stat-card";
import { useBusinesses, useProducts } from "../../../shared/store";

export function InventoryView() {
  const products = useProducts();
  const businesses = useBusinesses();
  const bizMap = new Map(businesses.map((b) => [b.id, b]));
  const lowStock = products.filter((p) => p.stock < 20).length;
  const outOfStock = products.filter((p) => p.stock === 0).length;
  return (
    <div className="space-y-5">
      <SectionHead eyebrow="Stok" title="Inventory" subtitle="Stok real-time per unit usaha — alert saat menipis." />
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard icon={Package} label="Total produk" value={products.length} />
        <StatCard label="Stok menipis" value={lowStock} hint="< 20 unit" />
        <StatCard label="Habis" value={outOfStock} />
        <StatCard label="Unit unik" value={new Set(products.map((p) => p.unit)).size} />
      </div>

      <div className="flex justify-end">
        <Button size="sm" className="gap-1"><Plus className="size-4" /> Produk baru</Button>
      </div>

      <Card className="border-border/60 bg-card/60">
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead className="border-b border-border/60 bg-muted/30 text-left text-xs uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Produk</th>
                <th className="px-4 py-3">SKU</th>
                <th className="px-4 py-3">Unit Usaha</th>
                <th className="px-4 py-3">Harga</th>
                <th className="px-4 py-3">Stok</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-t border-border/60">
                  <td className="px-4 py-3">{p.name}</td>
                  <td className="px-4 py-3 font-mono text-[11px] text-muted-foreground">{p.sku}</td>
                  <td className="px-4 py-3 text-muted-foreground">{bizMap.get(p.businessId)?.name ?? "—"}</td>
                  <td className="px-4 py-3">{p.priceLabel}</td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" className={"rounded-full text-[10px] " + (p.stock < 20 ? "border-amber-500/40 text-amber-500" : "")}>
                      {p.stock} {p.unit}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
