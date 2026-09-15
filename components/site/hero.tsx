import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getFrameworkCoverage } from "@/lib/content/slice-framework-support";
import { site } from "@/lib/content/site";

export function Hero() {
  const coverage = getFrameworkCoverage();
  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 [background:radial-gradient(50rem_30rem_at_top,oklch(0.985_0_0/0.06),transparent)]"
      />
      <div className="mx-auto flex max-w-5xl flex-col items-center px-4 pb-14 pt-16 text-center sm:px-6 sm:pt-20 md:pt-24 lg:px-8">
        <Link
          href="/agents"
          className="group inline-flex min-h-10 items-center gap-2 rounded-full border border-border/70 bg-card/50 px-4 py-2 text-sm text-muted-foreground transition-colors hover:border-foreground/20 hover:bg-accent/40 hover:text-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
        >
          New: Install with Agent
          <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
        </Link>
        <h1 className="mt-6 text-balance text-4xl font-semibold tracking-[-0.035em] sm:text-5xl md:text-6xl lg:text-7xl">
          Rahman Resources for your
          <br className="hidden sm:inline" /> next app.
        </h1>
        <p className="mt-5 max-w-2xl text-balance text-base leading-7 text-muted-foreground sm:text-lg">
          {coverage.svelte} canonical slices ship for Next.js/React and SvelteKit/Svelte 5 —
          copy-first, renderer-aware, npm/Bun-ready, with Tailwind 4, TypeScript strict and
          optional Convex. {site.description.split(".")[0]}.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button asChild size="lg" className="min-h-11">
            <Link href="/tour">Take the tour</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="min-h-11 gap-2">
            <Link href="/docs">
              View docs
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
