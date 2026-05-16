import { Check } from "lucide-react";

const TIERS = [
  { name: "Free", price: 0, blurb: "Hobby projects", features: ["1 seat", "5 slices"] },
  { name: "Solo", price: 9, blurb: "Personal", features: ["1 seat", "All slices", "Bidir sync"] },
  { name: "Pro", price: 29, blurb: "Small teams", features: ["5 seats", "Priority support", "Audit log"], featured: true },
  { name: "Scale", price: 99, blurb: "Growing orgs", features: ["Unlimited seats", "SSO", "Dedicated CSM"] },
];

export default function Page() {
  return (
    <main className="min-h-screen bg-background">
      <section className="mx-auto max-w-7xl px-6 py-20">
        <header className="mb-12 text-center">
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">Four flavors. One platform.</h1>
          <p className="mt-4 text-balance text-muted-foreground">Start free, scale when ready.</p>
        </header>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {TIERS.map((t) => (
            <div
              key={t.name}
              className={`relative flex flex-col rounded-xl border p-6 ${
                t.featured ? "border-primary/60 bg-primary/[0.04]" : "border-border/60 bg-card"
              }`}
            >
              {t.featured && (
                <span className="absolute right-4 top-4 rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary-foreground">
                  Best value
                </span>
              )}
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">{t.name}</h2>
              <p className="mt-1 text-xs text-muted-foreground">{t.blurb}</p>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-3xl font-bold tracking-tight">${t.price}</span>
                <span className="text-xs text-muted-foreground">/mo</span>
              </div>
              <ul className="mt-5 grow space-y-2 text-sm">
                {t.features.map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <Check className="size-3.5 shrink-0 text-emerald-500" /> {f}
                  </li>
                ))}
              </ul>
              <button
                className={`mt-6 inline-flex h-9 w-full items-center justify-center rounded-md text-sm font-medium ${
                  t.featured ? "bg-primary text-primary-foreground hover:bg-primary/90" : "border border-border/60 hover:bg-muted"
                }`}
              >
                {t.price === 0 ? "Start free" : "Get started"}
              </button>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
