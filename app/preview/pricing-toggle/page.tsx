"use client";

import * as React from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";

const TIERS = [
  { name: "Hobby", monthly: 0, yearly: 0, features: ["1 seat", "5 slices", "Community"] },
  { name: "Pro", monthly: 19, yearly: 15, features: ["5 seats", "All slices", "Bidir sync", "Priority"], featured: true },
  { name: "Business", monthly: 49, yearly: 39, features: ["Unlimited", "SSO", "Audit log", "SLA"] },
];

export default function Page() {
  const [yearly, setYearly] = React.useState(true);
  return (
    <main className="min-h-screen bg-background">
      <section className="mx-auto max-w-5xl px-6 py-20">
        <header className="mb-10 text-center">
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">Simple pricing</h1>
          <div className="mt-6 inline-flex items-center gap-1 rounded-full border border-border/60 bg-muted/30 p-1 text-sm">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setYearly(false)}
              className={`h-auto rounded-full px-4 py-1.5 transition ${!yearly ? "bg-background shadow" : "text-muted-foreground"}`}
            >
              Monthly
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setYearly(true)}
              className={`h-auto rounded-full px-4 py-1.5 transition ${yearly ? "bg-background shadow" : "text-muted-foreground"}`}
            >
              Yearly <span className="ml-1 rounded bg-emerald-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">-20%</span>
            </Button>
          </div>
        </header>
        <div className="grid gap-5 md:grid-cols-3">
          {TIERS.map((t) => {
            const price = yearly ? t.yearly : t.monthly;
            return (
              <div
                key={t.name}
                className={`rounded-2xl border p-7 ${
                  t.featured ? "border-primary/50 bg-primary/[0.04] shadow-lg shadow-primary/10" : "border-border/60 bg-card"
                }`}
              >
                <h2 className="text-base font-semibold">{t.name}</h2>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-bold tracking-tight">${price}</span>
                  <span className="text-sm text-muted-foreground">/mo</span>
                </div>
                {yearly && t.yearly !== t.monthly && (
                  <p className="mt-1 text-xs text-muted-foreground line-through">${t.monthly}/mo</p>
                )}
                <ul className="mt-6 space-y-2.5 text-sm">
                  {t.features.map((f) => (
                    <li key={f} className="flex items-center gap-2">
                      <Check className="size-4 shrink-0 text-emerald-500" /> {f}
                    </li>
                  ))}
                </ul>
                <Button
                  type="button"
                  variant={t.featured ? "default" : "outline"}
                  className={`mt-7 h-10 w-full rounded-md text-sm font-medium ${
                    t.featured ? "bg-primary text-primary-foreground hover:bg-primary/90" : "border border-border/60 hover:bg-muted"
                  }`}
                >
                  Choose {t.name}
                </Button>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}
