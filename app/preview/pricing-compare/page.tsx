import { Check, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";

const PLANS = ["Free", "Pro", "Team"] as const;
const ROWS: { feature: string; values: (boolean | string)[] }[] = [
  { feature: "Projects", values: ["1", "10", "Unlimited"] },
  { feature: "Slices catalog", values: [true, true, true] },
  { feature: "Bidir sync", values: [false, true, true] },
  { feature: "Audit-bp gate", values: [false, true, true] },
  { feature: "SSO", values: [false, false, true] },
  { feature: "Custom contracts", values: [false, false, true] },
  { feature: "Priority support", values: [false, true, true] },
  { feature: "Slack channel", values: [false, false, true] },
];
const PRICES = ["$0", "$19", "$49"];

export default function Page() {
  return (
    <main className="min-h-screen bg-background">
      <section className="mx-auto max-w-5xl px-6 py-20">
        <header className="mb-10 text-center">
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">Compare plans</h1>
          <p className="mt-3 text-muted-foreground">Every feature, side by side.</p>
        </header>
        <div className="overflow-hidden rounded-2xl border border-border/60 bg-card">
          <div className="grid grid-cols-4 border-b border-border/60 bg-muted/30 px-6 py-5">
            <div />
            {PLANS.map((p, i) => (
              <div key={p} className="text-center">
                <p className="text-sm font-semibold">{p}</p>
                <p className="mt-1 text-2xl font-bold tracking-tight">{PRICES[i]}<span className="text-xs font-normal text-muted-foreground">/mo</span></p>
              </div>
            ))}
          </div>
          <div className="divide-y divide-border/40">
            {ROWS.map((r) => (
              <div key={r.feature} className="grid grid-cols-4 items-center px-6 py-3 text-sm">
                <div className="text-muted-foreground">{r.feature}</div>
                {r.values.map((v, i) => (
                  <div key={i} className="flex justify-center">
                    {typeof v === "boolean" ? (
                      v ? <Check className="size-4 text-emerald-500" /> : <Minus className="size-4 text-muted-foreground/40" />
                    ) : (
                      <span className="text-sm font-medium">{v}</span>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-4 border-t border-border/60 bg-muted/20 px-6 py-4">
            <div />
            {PLANS.map((p, i) => (
              <Button
                key={p}
                type="button"
                variant={i === 1 ? "default" : "outline"}
                className={`mx-1 inline-flex h-9 items-center justify-center rounded-md text-xs font-medium ${
                  i === 1 ? "bg-primary text-primary-foreground" : "border border-border/60 hover:bg-muted"
                }`}
              >
                Choose {p}
              </Button>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
