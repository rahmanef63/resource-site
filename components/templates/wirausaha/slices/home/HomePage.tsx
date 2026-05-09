"use client";

import * as React from "react";
import { Building2, Package, ShoppingCart, Wallet } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  HeroBlock,
  SectionHead,
  FeatureGrid,
  type FeatureItem,
} from "@/components/templates/_shared";
import { useBusinesses, useProducts } from "../../shared/store";
import { ADMIN_BASE, PUBLIC_BASE } from "../../shared/nav-config";

const FEATURES: FeatureItem[] = [
  { icon: Building2, title: "Multi-unit", blurb: "Kelola banyak warung/toko/jasa dari satu dashboard." },
  { icon: Package, title: "Inventory live", blurb: "Stok update real-time, alert otomatis sebelum habis." },
  { icon: ShoppingCart, title: "Order tracking", blurb: "Status order dari new → delivered tercatat lengkap." },
  { icon: Wallet, title: "Finance + AI", blurb: "Catat income/expense, AI bantu narasi laporan bulanan." },
];

export function HomePage() {
  const businesses = useBusinesses();
  const products = useProducts().slice(0, 6);
  return (
    <>
      <HeroBlock
        glow
        badge="Untuk wirausaha multi-unit"
        title="Kelola banyak unit usaha dari satu workspace."
        subtitle="Inventory, order, finance, staff — semua jadi satu. AI bantu narasi laporan bulanan dalam bahasa Indonesia."
        primaryCta={{ label: "Buka workspace", href: ADMIN_BASE }}
        secondaryCta={{ label: "Hubungi kami", href: `${PUBLIC_BASE}/contact` }}
      />

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <SectionHead
          eyebrow="Fitur"
          title="Operasi multi-unit, satu kontrol panel"
          subtitle="Semua yang dibutuhkan wirausaha untuk kelola unit kuliner, retail, dan jasa."
        />
        <FeatureGrid items={FEATURES} columns={4} className="mt-10" />
      </section>

      <section className="border-y border-border/50 bg-muted/10">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <SectionHead
            eyebrow="Unit usaha"
            title="Yang sudah jalan di Wirausaha OS"
            subtitle="Sebagian unit usaha yang dikelola lewat workspace ini."
          />
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {businesses.map((b) => (
              <Card key={b.id} className="border-border/60 bg-card/60">
                <CardContent className="space-y-2 p-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className="rounded-full text-[10px]">{b.type}</Badge>
                    <Badge variant="outline" className="rounded-full text-[10px]">{b.city}</Badge>
                  </div>
                  <h3 className="text-base font-medium">{b.name}</h3>
                  <p className="text-sm text-muted-foreground">{b.staffCount} staff aktif</p>
                  <p className="pt-1 text-[11px] text-muted-foreground">
                    Revenue bulanan: Rp {(b.monthlyRevenue / 1_000_000).toFixed(1)}jt
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <SectionHead
          eyebrow="Katalog"
          title="Produk & jasa"
          subtitle="Daftar produk multi-unit yang aktif tersedia."
          cta={{ label: "Lihat semua", href: `${PUBLIC_BASE}/services` }}
        />
        <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => (
            <Card key={p.id} className="border-border/60 bg-card/60">
              <CardContent className="space-y-1 p-4">
                <p className="text-sm font-medium">{p.name}</p>
                <p className="text-xs text-muted-foreground">SKU: {p.sku}</p>
                <p className="text-base font-semibold">{p.priceLabel}</p>
                <p className="text-[11px] text-muted-foreground">Stok: {p.stock} {p.unit}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </>
  );
}
