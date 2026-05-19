"use client";

import { Building2, Package, ShoppingCart, Wallet } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  HeroBlock,
  SectionHead,
  FeatureGrid,
  CtaBand,
  type FeatureItem,
} from "@/components/templates/_shared";
import type { LandingSection } from "@/components/templates/_shared/landing/types";
import { ADMIN_BASE, PUBLIC_BASE } from "../../shared/nav-config";
import type { Business, Product } from "../../shared/types";

interface Deps {
  businesses: Business[];
  products: Product[];
}

const FEATURE_ITEMS: FeatureItem[] = [
  { icon: Building2, title: "Multi-unit", blurb: "Kelola banyak warung/toko/jasa dari satu dashboard." },
  { icon: Package, title: "Inventory live", blurb: "Stok update real-time, alert otomatis sebelum habis." },
  { icon: ShoppingCart, title: "Order tracking", blurb: "Status order dari new → delivered tercatat lengkap." },
  { icon: Wallet, title: "Finance + AI", blurb: "Catat income/expense, AI bantu narasi laporan bulanan." },
];

/**
 * Maps each enabled landingSection.kind to its wirausaha renderer.
 * Admin-editable title/subtitle thread through; unknown kinds render a
 * minimal stub so admin still sees them without crashing the page.
 */
export function renderLanding(section: LandingSection, deps: Deps) {
  switch (section.kind) {
    case "hero":
      return (
        <HeroBlock
          key={section.id}
          glow
          badge={parseConfigBadge(section.config) ?? "Untuk wirausaha multi-unit"}
          title={section.title}
          subtitle={section.subtitle}
          primaryCta={{ label: "Buka workspace", href: ADMIN_BASE }}
          secondaryCta={{ label: "Hubungi kami", href: `${PUBLIC_BASE}/contact` }}
        />
      );

    case "features":
      return (
        <section key={section.id} className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <SectionHead
            eyebrow="Fitur"
            title={section.title}
            subtitle={section.subtitle}
          />
          <FeatureGrid items={FEATURE_ITEMS} columns={4} className="mt-10" />
        </section>
      );

    case "portfolio":
      return (
        <section key={section.id} className="border-y border-border/50 bg-muted/10">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
            <SectionHead
              eyebrow="Unit usaha"
              title={section.title}
              subtitle={section.subtitle}
            />
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {deps.businesses.map((b) => (
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
      );

    case "services":
      return (
        <section key={section.id} className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <SectionHead
            eyebrow="Katalog"
            title={section.title}
            subtitle={section.subtitle}
            cta={{ label: "Lihat semua", href: `${PUBLIC_BASE}/services` }}
          />
          <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {deps.products.slice(0, 6).map((p) => (
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

    case "cta":
      return (
        <CtaBand
          key={section.id}
          title={section.title}
          subtitle={section.subtitle ?? "Demo workspace dalam 5 menit."}
          cta={{ label: "Mulai sekarang", href: ADMIN_BASE }}
        />
      );

    case "stats":
    case "pricing":
    case "blog":
    case "changelog":
    case "testimonials":
    case "faq":
    case "newsletter":
    case "custom":
      return (
        <section
          key={section.id}
          className="border-b border-border/40 bg-muted/10 py-12"
        >
          <div className="mx-auto max-w-3xl px-6 text-center">
            <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
              {section.kind}
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">{section.title}</h2>
            {section.subtitle ? (
              <p className="mt-3 text-sm text-muted-foreground">{section.subtitle}</p>
            ) : null}
          </div>
        </section>
      );

    default:
      return null;
  }
}

function parseConfigBadge(config?: string): string | undefined {
  if (!config) return undefined;
  try {
    const parsed = JSON.parse(config) as { badge?: unknown };
    return typeof parsed.badge === "string" ? parsed.badge : undefined;
  } catch {
    return undefined;
  }
}
