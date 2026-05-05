"use client";

import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionHead } from "@/components/templates/_shared/ui/section-head";
import { usePricing } from "../../shared/store";

export function PricingPage() {
  const tiers = usePricing();
  return (
    <section>
      <div className="mx-auto max-w-6xl px-6 py-20">
        <SectionHead
          eyebrow="Pricing"
          title="Free forever. Paid plans when you outgrow it."
          subtitle="No per-seat fees on Free. EU + US data residency on Team and above."
        />
        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {tiers.map((p) => (
            <div
              key={p.id}
              className={`rounded-lg border bg-card p-7 ${p.featured ? "border-foreground/40 ring-1 ring-foreground/10" : "border-border/60"}`}
            >
              <h3 className="text-lg font-medium">{p.name}</h3>
              <p className="mt-2 text-4xl font-semibold tracking-tight">{p.price}</p>
              <p className="text-xs text-muted-foreground">{p.period}</p>
              <p className="mt-4 text-sm text-muted-foreground">{p.blurb}</p>
              <ul className="mt-5 space-y-2 text-sm">
                {p.bullets.map((b) => (
                  <li key={b} className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 size-3.5 text-muted-foreground" /> {b}
                  </li>
                ))}
              </ul>
              <Button asChild variant={p.featured ? "default" : "outline"} className="mt-6 w-full">
                <Link href={p.cta.href}>{p.cta.label}</Link>
              </Button>
            </div>
          ))}
        </div>
        <div className="mx-auto mt-12 max-w-2xl rounded-lg border border-border/60 bg-muted/30 p-6 text-center">
          <p className="text-sm text-muted-foreground">
            Need on-prem, BAA, or volume contracts? <Link href="../contact" className="font-medium text-foreground underline-offset-4 hover:underline">Talk to sales</Link>.
          </p>
        </div>
      </div>
    </section>
  );
}
