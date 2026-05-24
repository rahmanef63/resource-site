"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, Check, Clock, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { PUBLIC_BASE } from "../../shared/nav-config";
import { usePackages } from "../../shared/store";
import type { PricingPackage } from "../../shared/types";
import { PricingFaq } from "./PricingFaq";
import { PricingCompare } from "./PricingCompare";

/**
 * Public service packages — newsletter sponsor, carousel pack, custom
 * production, strategy sprint. Pure shadcn composition; admin edit not
 * yet wired (packages seed read-only). FAQ + compare in sibling files
 * for 200-LOC cap.
 */
export function PricingPage() {
  const packages = usePackages();
  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <header className="text-center">
        <p className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground">Pricing</p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight md:text-5xl">
          Kerja sama — pilih sesuai konteks tim kamu.
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
          Empat paket utama, semua transparan. Untuk custom scope, langsung email — biasanya
          balas H+1 kerja dengan estimasi awal.
        </p>
      </header>

      <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {packages.map((p) => (
          <PackageCard key={p.id} pkg={p} />
        ))}
      </div>

      <Separator className="my-16 opacity-60" />

      <PricingFaq />
      <PricingCompare />
      <BottomCta />
    </section>
  );
}

function PackageCard({ pkg }: { pkg: PricingPackage }) {
  return (
    <Card
      className={
        pkg.featured
          ? "relative border-foreground/30 bg-card shadow-sm"
          : "border-border/60 bg-card/60"
      }
    >
      {pkg.badge && (
        <Badge className="absolute -top-2 left-5 rounded-full px-2.5 py-0.5 text-[10px]" variant="default">
          <Sparkles className="size-3" /> {pkg.badge}
        </Badge>
      )}
      <CardContent className="flex h-full flex-col gap-4 p-6">
        <div>
          <h3 className="text-lg font-semibold tracking-tight">{pkg.name}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{pkg.tagline}</p>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-semibold tracking-tight">{pkg.price}</span>
          {pkg.period && <span className="text-sm text-muted-foreground">{pkg.period}</span>}
        </div>
        <ul className="flex-1 space-y-2 text-sm text-foreground/85">
          {pkg.bullets.map((b) => (
            <li key={b} className="flex items-start gap-2">
              <Check className="mt-0.5 size-3.5 shrink-0 text-foreground/70" />
              <span>{b}</span>
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
          <Clock className="size-3" />
          Turnaround ~{pkg.turnaroundDays} hari kerja
        </div>
        <Button asChild variant={pkg.featured ? "default" : "outline"} className="w-full">
          <Link href={`${PUBLIC_BASE}/about`}>
            Mulai diskusi <ArrowRight className="size-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

function BottomCta() {
  return (
    <Card className="mt-20 border-border/60 bg-gradient-to-br from-card via-card to-muted/40">
      <CardContent className="flex flex-col items-start gap-3 p-8 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="text-xl font-semibold tracking-tight">Belum yakin yang mana?</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Brief 15 menit free — saya bantu rekomendasi paket yang fit konteks kamu.
          </p>
        </div>
        <Button asChild>
          <Link href={`${PUBLIC_BASE}/about`}>Book brief call <ArrowRight className="size-4" /></Link>
        </Button>
      </CardContent>
    </Card>
  );
}
