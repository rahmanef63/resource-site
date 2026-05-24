import Link from "next/link";
import { ArrowRight, Quote } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PUBLIC_BASE } from "../../shared/nav-config";
import { HOME_PRICING_TEASER, HOME_TESTIMONIALS } from "./home-data";

/** CK-2B — testimonials grid (2x2). Quote-icon header + role labels. */
export function HomeTestimonials() {
  return (
    <section className="border-t border-border/60 bg-muted/10">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
            Customer voices
          </p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">
            What teams say after switching
          </h2>
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {HOME_TESTIMONIALS.map((t, i) => (
            <Card key={i} className="border-border/60 bg-card/60">
              <CardContent className="p-6">
                <Quote className="size-5 text-muted-foreground/70" />
                <p className="mt-3 text-base leading-relaxed text-foreground/90">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="mt-5 flex items-center gap-3 border-t border-border/40 pt-4">
                  <div className="grid size-9 place-items-center rounded-full bg-gradient-to-br from-violet-500/30 to-indigo-500/30 text-sm font-semibold">
                    {t.name
                      .split(" ")
                      .map((s) => s[0])
                      .join("")}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

/** CK-2B — pricing teaser strip (3 tiers, compact). Drives traffic to /pricing. */
export function HomePricingTeaser() {
  return (
    <section>
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
              Pricing
            </p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight">
              Start free. Pay when you outgrow it.
            </h2>
          </div>
          <Button asChild variant="ghost">
            <Link href={`${PUBLIC_BASE}/pricing`}>
              Compare plans <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
        <div className="mt-8 grid gap-3 md:grid-cols-3">
          {HOME_PRICING_TEASER.map((t, i) => (
            <Card
              key={t.plan}
              className={
                "border-border/60 bg-card/60" + (i === 1 ? " ring-1 ring-violet-500/40" : "")
              }
            >
              <CardContent className="p-5">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold">{t.plan}</p>
                  {i === 1 && (
                    <Badge variant="default" className="rounded-full text-[10px]">
                      Most popular
                    </Badge>
                  )}
                </div>
                <p className="mt-2 text-3xl font-semibold tabular-nums">{t.price}</p>
                <p className="mt-2 text-sm text-muted-foreground">{t.blurb}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
