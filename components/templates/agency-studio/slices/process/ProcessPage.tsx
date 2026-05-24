"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SectionHead } from "@/components/templates/_shared/ui/section-head";
import { SEED_PROCESS_STEPS } from "../../shared/journal-seed";
import { PUBLIC_BASE } from "../../shared/nav-config";

/**
 * Process page — visual stepper showing the 4-phase studio engagement
 * (Discovery → Design Sprint → Build → Launch). Each step is a card with
 * phase, blurb, duration, and deliverable bullets.
 */
export function ProcessPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <SectionHead
        align="center"
        eyebrow="How we work"
        title="Empat fase, satu sistem"
        subtitle="Dari discovery hingga six-week revisit — bukan handoff, tapi adopsi. Setiap fase punya scope yang jelas, deliverable yang spesifik, dan tim klien yang terlibat sejak hari satu."
      />

      <ol className="mt-14 space-y-6">
        {SEED_PROCESS_STEPS.map((step, i) => (
          <li key={step.id} className="relative">
            {i < SEED_PROCESS_STEPS.length - 1 && (
              <span
                aria-hidden
                className="absolute left-[27px] top-16 hidden h-[calc(100%+0px)] w-px bg-border md:block"
              />
            )}
            <Card className="border-border/60">
              <CardContent className="grid gap-5 p-6 md:grid-cols-[56px_1fr] md:p-7">
                <div className="grid size-14 place-items-center rounded-full border border-border bg-muted/40 text-base font-semibold">
                  {String(step.index).padStart(2, "0")}
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="text-xl font-semibold tracking-tight">{step.phase}</h3>
                    <Badge variant="secondary" className="font-normal">{step.duration}</Badge>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground md:text-base">{step.blurb}</p>
                  <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                    {step.deliverables.map((d) => (
                      <li key={d} className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                        <span>{d}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </li>
        ))}
      </ol>

      <Card className="mt-12 border-border/60 bg-muted/30">
        <CardContent className="flex flex-wrap items-center justify-between gap-4 p-6">
          <div className="max-w-md">
            <h3 className="text-lg font-medium">Siap untuk brief?</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Respons dalam 24 jam. Tidak ada commitment di tahap awal — kami pelajari konteks dulu.
            </p>
          </div>
          <Button asChild className="gap-2">
            <Link href={`${PUBLIC_BASE}/contact`}>
              Mulai discovery <ArrowRight className="size-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
