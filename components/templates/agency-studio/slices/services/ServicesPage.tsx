"use client";

import Link from "next/link";
import { Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useServices } from "../../shared/store";
import { SectionHead } from "@/components/templates/_shared/ui/section-head";
import { PUBLIC_BASE } from "../../shared/nav-config";

export function ServicesPage() {
  const services = useServices();
  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <SectionHead
        eyebrow="Services"
        title="Productized engagements"
        subtitle="Predictable scope, predictable price. Custom work also available — start with a brief."
      />
      <div className="mt-12 grid gap-6 md:grid-cols-2">
        {services.map((s) => (
          <Card key={s.id} className="flex flex-col border-border/60">
            <CardContent className="flex flex-1 flex-col gap-4 p-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-xl font-semibold tracking-tight">{s.name}</h3>
                  <p className="text-xs text-muted-foreground">{s.duration}</p>
                </div>
                {s.featured && <Badge variant="secondary">Most booked</Badge>}
              </div>
              <p className="text-sm text-muted-foreground">{s.blurb}</p>
              <ul className="space-y-2 text-sm">
                {s.bullets.map((b) => (
                  <li key={b} className="flex items-start gap-2">
                    <Check className="mt-0.5 size-4 shrink-0 text-foreground" />
                    <span className="text-muted-foreground">{b}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-auto flex items-end justify-between border-t border-border/60 pt-4">
                <p className="text-2xl font-semibold tracking-tight">{s.priceLabel}</p>
                <Button asChild>
                  <Link href={`${PUBLIC_BASE}/contact`}>Brief us</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
