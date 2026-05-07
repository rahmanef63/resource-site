"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, Building2, Package, ShoppingCart, Sparkles, Wallet } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SectionHead } from "@/components/templates/_shared/ui/section-head";
import { useBusinesses, useProducts } from "../../shared/store";
import { ADMIN_BASE, PUBLIC_BASE } from "../../shared/nav-config";

const FEATURES = [
  { icon: Building2,    title: "Multi-unit",       blurb: "Kelola banyak warung/toko/jasa dari satu dashboard." },
  { icon: Package,      title: "Inventory live",   blurb: "Stok update real-time, alert otomatis sebelum habis." },
  { icon: ShoppingCart, title: "Order tracking",   blurb: "Status order dari new → delivered tercatat lengkap." },
  { icon: Wallet,       title: "Finance + AI",     blurb: "Catat income/expense, AI bantu narasi laporan bulanan." },
];

export function HomePage() {
  const businesses = useBusinesses();
  const products = useProducts().slice(0, 6);
  return (
    <>
      <Hero />
      <FeatureGrid />
      <BusinessShowcase businesses={businesses} />
      <ProductStrip products={products} />
    </>
  );
}

function Hero() {
  return (
    <section className="relative isolate overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background" />
        <div className="absolute -right-40 top-32 h-96 w-96 rounded-full bg-orange-500/15 blur-3xl" />
        <div className="absolute -left-40 bottom-0 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl" />
      </div>
      <div className="mx-auto max-w-6xl px-6 pt-24 pb-28 md:pt-32 md:pb-36">
        <Badge variant="secondary" className="rounded-full px-3 py-1 text-[11px]">
          <Sparkles className="mr-1 size-3" /> Untuk wirausaha multi-unit
        </Badge>
        <h1 className="mt-6 max-w-4xl text-4xl font-semibold leading-[1.05] tracking-tight md:text-6xl">
          Kelola banyak unit usaha dari satu workspace.
        </h1>
        <p className="mt-5 max-w-2xl text-lg text-muted-foreground md:text-xl">
          Inventory, order, finance, staff — semua jadi satu. AI bantu narasi laporan bulanan dalam bahasa Indonesia.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button size="lg" asChild>
            <Link href={ADMIN_BASE}>Buka workspace <ArrowRight className="size-4" /></Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href={`${PUBLIC_BASE}/contact`}>Hubungi kami</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

function FeatureGrid() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-20">
      <SectionHead
        eyebrow="Fitur"
        title="Operasi multi-unit, satu kontrol panel"
        subtitle="Semua yang dibutuhkan wirausaha untuk kelola unit kuliner, retail, dan jasa."
      />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {FEATURES.map((f) => {
          const Icon = f.icon;
          return (
            <Card key={f.title} className="border-border/60 bg-card/60">
              <CardContent className="p-6">
                <Icon className="size-5 text-foreground/80" />
                <h3 className="mt-4 text-base font-medium">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{f.blurb}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}

function BusinessShowcase({ businesses }: { businesses: ReturnType<typeof useBusinesses> }) {
  return (
    <section className="border-y border-border/50 bg-muted/10">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <SectionHead
          eyebrow="Unit usaha"
          title="Yang sudah jalan di Wirausaha OS"
          subtitle="Sebagian unit usaha yang dikelola lewat workspace ini."
        />
        <div className="grid gap-4 md:grid-cols-3">
          {businesses.map((b) => (
            <Card key={b.id} className="border-border/60 bg-card/60">
              <CardContent className="space-y-2 p-5">
                <div className="flex items-center gap-2">
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
  );
}

function ProductStrip({ products }: { products: ReturnType<typeof useProducts> }) {
  return (
    <section className="mx-auto max-w-6xl px-6 py-20">
      <SectionHead
        eyebrow="Katalog"
        title="Produk & jasa"
        subtitle="Daftar produk multi-unit yang aktif tersedia."
        cta={{ label: "Lihat semua", href: `${PUBLIC_BASE}/services` }}
      />
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
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
  );
}
