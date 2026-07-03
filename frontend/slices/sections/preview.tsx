"use client";
/** Variant preview (VP wave) — rr-internal, stripped on `rr add`. */
import type { SlicePreviewModule } from "@/shared/preview/types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LandingSectionShell } from "./components/LandingSectionShell";
import type { LandingSection } from "./types";

const HERO: LandingSection = { id: "hero", order: 10, kind: "hero", title: "Build landing pages from blocks", subtitle: "Admin-editable sections, no code redeploy.", enabled: true };
const FEATURES: LandingSection = { id: "features", order: 20, kind: "features", title: "What you get", subtitle: "Scan it in ten seconds.", enabled: true };
const CTA: LandingSection = { id: "cta", order: 30, kind: "cta", title: "Ready to start?", subtitle: "Drop in a section and ship.", enabled: true };

const SCENARIOS: Record<string, LandingSection[]> = {
  "hero-only": [HERO],
  "hero-features": [HERO, FEATURES],
  "full-page": [HERO, FEATURES, CTA],
};

function Block({ section }: { section: LandingSection }) {
  if (section.kind === "features") {
    return (
      <LandingSectionShell section={section} defaultClassName="border-t py-8">
        <div className="container mx-auto px-6">
          <h2 className="text-2xl font-semibold">{section.title}</h2>
          <p className="text-sm text-muted-foreground">{section.subtitle}</p>
          <div className="mt-4 grid grid-cols-3 gap-3">
            {["Fast", "Owned", "Themed"].map((f) => (
              <div key={f} className="rounded-md border border-border bg-muted/30 p-3 text-sm font-medium">{f}</div>
            ))}
          </div>
        </div>
      </LandingSectionShell>
    );
  }
  if (section.kind === "cta") {
    return (
      <LandingSectionShell section={section} defaultClassName="border-t py-10">
        <div className="container mx-auto flex flex-col items-center gap-3 px-6 text-center">
          <h2 className="text-2xl font-semibold">{section.title}</h2>
          <p className="text-sm text-muted-foreground">{section.subtitle}</p>
          <Button size="sm">Get started</Button>
        </div>
      </LandingSectionShell>
    );
  }
  return (
    <LandingSectionShell section={section} defaultClassName="py-12">
      <div className="container mx-auto px-6 text-center">
        <h1 className="text-3xl font-bold tracking-tight">{section.title}</h1>
        <p className="mt-2 text-base text-muted-foreground">{section.subtitle}</p>
        <div className="mt-4 flex justify-center gap-2">
          <Button size="sm">Start</Button>
          <Button size="sm" variant="outline">Docs</Button>
        </div>
      </div>
    </LandingSectionShell>
  );
}

const preview: SlicePreviewModule = {
  LandingSectionShell: ({ variant }) => {
    const scenario = variant.scenario ?? "hero-only";
    const sections = SCENARIOS[scenario] ?? SCENARIOS["hero-only"];
    return (
      <div className="p-4">
        <div className="h-[360px] overflow-hidden rounded-lg border border-border bg-background">
          <div className={cn("origin-top scale-[0.72]")}>
            {sections.map((s) => <Block key={s.id} section={s} />)}
          </div>
        </div>
      </div>
    );
  },
};
export default preview;
