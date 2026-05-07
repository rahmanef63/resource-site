"use client";

import { Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { SectionHead } from "@/components/templates/_shared/ui/section-head";
import { useBusinesses, useProducts } from "../../shared/store";

export function ServicesPage() {
  const businesses = useBusinesses();
  const products = useProducts();
  const bizMap = new Map(businesses.map((b) => [b.id, b]));
  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <SectionHead
        eyebrow="Katalog"
        title="Produk & jasa multi-unit"
        subtitle="Daftar lengkap dari semua unit usaha yang tergabung."
      />

      <div className="space-y-8">
        {businesses.map((b) => {
          const items = products.filter((p) => p.businessId === b.id);
          if (!items.length) return null;
          return (
            <div key={b.id}>
              <div className="mb-3 flex items-center gap-2">
                <h3 className="text-base font-medium">{b.name}</h3>
                <Badge variant="outline" className="rounded-full text-[10px]">{b.type}</Badge>
                <Badge variant="outline" className="rounded-full text-[10px]">{b.city}</Badge>
              </div>
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {items.map((p) => (
                  <Card key={p.id} className="border-border/60 bg-card/60">
                    <CardContent className="space-y-1 p-4">
                      <Package className="size-4 text-muted-foreground" />
                      <p className="text-sm font-medium">{p.name}</p>
                      <p className="text-xs text-muted-foreground">SKU: {p.sku}</p>
                      <div className="flex items-center justify-between pt-1">
                        <p className="text-base font-semibold">{p.priceLabel}</p>
                        <p className="text-[11px] text-muted-foreground">{p.stock} {p.unit}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
