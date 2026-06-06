import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { layouts } from "@/lib/content/layouts";
import { slices } from "@/lib/content/slices";
import { site } from "@/lib/content/site";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 [background:radial-gradient(50rem_30rem_at_top,oklch(0.985_0_0/0.06),transparent)]"
      />
      <div className="mx-auto flex max-w-5xl flex-col items-center px-4 pb-12 pt-24 text-center sm:px-6 md:pt-28 lg:px-8">
        <Link
          href="/agents"
          className="group inline-flex items-center gap-2 rounded-full border border-border bg-card/40 px-4 py-1 text-sm text-muted-foreground transition-colors hover:bg-accent/40 hover:text-foreground"
        >
          New: Install with Agent
          <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
        </Link>
        <h1 className="mt-6 text-balance text-5xl font-bold tracking-tight md:text-7xl">
          Rahman Resources for your
          <br className="hidden sm:inline" /> next Next app.
        </h1>
        <p className="mt-6 max-w-2xl text-balance text-lg text-muted-foreground">
          {layouts.length} layouts, {slices.length} slices — copy-first, production-grade,
          handed to you with shadcn primitives, Convex self-hosted, Tailwind 4 and TypeScript
          strict. {site.description.split(".")[0]}.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button asChild size="lg">
            <Link href="/layouts">Browse layouts</Link>
          </Button>
          <Button asChild variant="ghost" size="lg" className="gap-2">
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
