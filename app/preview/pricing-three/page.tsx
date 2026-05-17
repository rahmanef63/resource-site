import { Check, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const TIERS = [
  { name: "Starter", price: 0, blurb: "For tinkering", features: ["1 project", "Community support", "Basic slices"], cta: "Start free" },
  { name: "Pro", price: 19, blurb: "For builders", features: ["10 projects", "Priority email", "All slices", "Bidir sync"], cta: "Start trial", featured: true },
  { name: "Team", price: 49, blurb: "For squads", features: ["Unlimited", "Slack support", "SSO + audit log", "Custom contracts"], cta: "Contact sales" },
];

export default function Page() {
  return (
    <main className="min-h-screen bg-background">
      <section className="mx-auto max-w-6xl px-6 py-20">
        <header className="mb-12 text-center">
          <span className="inline-block rounded-full border border-border/60 bg-muted/40 px-3 py-1 text-xs font-medium text-muted-foreground">Pricing</span>
          <h1 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">Pick the plan that fits</h1>
          <p className="mt-4 text-balance text-muted-foreground">Pay only for what you use. Cancel anytime.</p>
        </header>
        <div className="grid gap-6 md:grid-cols-3">
          {TIERS.map((t) => (
            <div
              key={t.name}
              className={`relative rounded-2xl border p-7 ${
                t.featured ? "border-primary/50 bg-primary/[0.03] shadow-lg shadow-primary/10" : "border-border/60 bg-card"
              }`}
            >
              {t.featured && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-primary-foreground">
                  Most popular
                </span>
              )}
              <h2 className="text-lg font-semibold">{t.name}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{t.blurb}</p>
              <div className="mt-5 flex items-baseline gap-1">
                <span className="text-4xl font-bold tracking-tight">${t.price}</span>
                <span className="text-sm text-muted-foreground">/mo</span>
              </div>
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
                className={`mt-7 inline-flex h-10 w-full items-center justify-center gap-2 rounded-md text-sm font-medium ${
                  t.featured ? "bg-primary text-primary-foreground hover:bg-primary/90" : "border border-border/60 hover:bg-muted"
                }`}
              >
                {t.cta} <ArrowRight className="size-4" />
              </Button>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
