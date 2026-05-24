import Link from "next/link";
import { ArrowRight, HelpCircle, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DEFAULT_SITE_CONFIG } from "../../shared/site-config";
import { PUBLIC_BASE } from "../../shared/nav-config";
import { PRICING_FAQ } from "./pricing-data";

/** CK-2B — FAQ accordion (static, server-rendered <details>) +
 *  custom-quote callout card. Keeps the page from ending on a wall of
 *  feature checks. */
export function PricingFaq() {
  return (
    <section>
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-16 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <p className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground">FAQ</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">
            Common questions
          </h2>
          <p className="mt-2 max-w-xl text-muted-foreground">
            If your question isn&rsquo;t here, email us — we answer support tickets
            within one business day on every plan, including Free.
          </p>
          <div className="mt-8 space-y-3">
            {PRICING_FAQ.map((item) => (
              <details
                key={item.q}
                className="group rounded-lg border border-border/60 bg-card/40 px-5 py-4 open:bg-card/60"
              >
                <summary className="flex cursor-pointer list-none items-start justify-between gap-4">
                  <span className="flex items-start gap-3 text-sm font-medium">
                    <HelpCircle className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                    {item.q}
                  </span>
                  <span className="mt-0.5 select-none text-muted-foreground transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-3 pl-7 text-sm leading-relaxed text-muted-foreground">
                  {item.a}
                </p>
              </details>
            ))}
          </div>
        </div>

        <aside className="lg:col-span-1">
          <Card className="border-border/60 bg-gradient-to-br from-violet-500/10 via-card/60 to-indigo-500/10">
            <CardContent className="p-6">
              <p className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
                Custom quote
              </p>
              <h3 className="mt-2 text-xl font-semibold tracking-tight">
                Need on-prem, BAA, or volume?
              </h3>
              <p className="mt-3 text-sm text-muted-foreground">
                Procurement-friendly contracts, annual billing, dedicated
                infra. Most quotes back within 48h.
              </p>
              <ul className="mt-5 space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <span className="grid size-1.5 place-items-center rounded-full bg-emerald-400" />
                  Helm chart for on-prem
                </li>
                <li className="flex items-center gap-2">
                  <span className="grid size-1.5 place-items-center rounded-full bg-emerald-400" />
                  Air-gapped deployments
                </li>
                <li className="flex items-center gap-2">
                  <span className="grid size-1.5 place-items-center rounded-full bg-emerald-400" />
                  Custom retention windows
                </li>
                <li className="flex items-center gap-2">
                  <span className="grid size-1.5 place-items-center rounded-full bg-emerald-400" />
                  Named CSM + 1h SLA
                </li>
              </ul>
              <div className="mt-6 flex flex-col gap-2">
                <Button asChild>
                  <Link href={`${PUBLIC_BASE}/contact`}>
                    Talk to sales <ArrowRight className="size-4" />
                  </Link>
                </Button>
                <Button asChild variant="ghost" size="sm">
                  <a href={`mailto:${DEFAULT_SITE_CONFIG.email}`}>
                    <Mail className="size-3.5" /> {DEFAULT_SITE_CONFIG.email}
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>
    </section>
  );
}
