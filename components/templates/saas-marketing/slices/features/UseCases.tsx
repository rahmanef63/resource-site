import Link from "next/link";
import { ArrowRight, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PUBLIC_BASE } from "../../shared/nav-config";
import { USE_CASES } from "./features-data";

/** CK-2B — three industry callouts with problem→solution→outcome triplets.
 *  Stops the page feeling like a checkbox dump by grounding it in stories. */
export function UseCases() {
  return (
    <section>
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
              Use cases
            </p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">
              What teams ship with it
            </h2>
            <p className="mt-2 max-w-xl text-muted-foreground">
              Three patterns we see weekly. The platform doesn&rsquo;t prescribe an
              industry — the shape just keeps recurring.
            </p>
          </div>
          <Button asChild variant="ghost">
            <Link href={`${PUBLIC_BASE}/contact`}>
              Talk to a solutions engineer <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {USE_CASES.map((u) => (
            <Card key={u.industry} className="border-border/60 bg-card/60">
              <CardContent className="p-6">
                <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted/30 px-3 py-1 text-[11px] uppercase tracking-wider text-muted-foreground">
                  <Target className="size-3" /> {u.industry}
                </div>
                <dl className="mt-5 space-y-4 text-sm">
                  <div>
                    <dt className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Problem
                    </dt>
                    <dd className="mt-1 leading-relaxed">{u.problem}</dd>
                  </div>
                  <div>
                    <dt className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Solution
                    </dt>
                    <dd className="mt-1 leading-relaxed">{u.solution}</dd>
                  </div>
                  <div className="rounded-md border border-emerald-500/20 bg-emerald-500/5 p-3">
                    <dt className="text-[10px] font-semibold uppercase tracking-wider text-emerald-400">
                      Outcome
                    </dt>
                    <dd className="mt-1 text-sm font-medium leading-relaxed">{u.outcome}</dd>
                  </div>
                </dl>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
