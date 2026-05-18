"use client";

import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePricing } from "../../shared/store";

/**
 * Client-side data grid for the public Pricing page. Reads live tiers from
 * the template store via usePricing(), so admin edits propagate via the
 * BroadcastChannel sync in createTemplateStore (cross-tab live update).
 */
export function PricingTiersClient() {
  const tiers = usePricing();
  return (
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
  );
}
