import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

export default function Page() {
  return (
    <main className="relative isolate min-h-screen overflow-hidden bg-background">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,theme(colors.primary/10),transparent_60%)]" />
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_bottom,transparent,theme(colors.background))]" />
      <section className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center px-6 py-24 text-center">
        <span className="mb-6 inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-background/70 px-3 py-1 text-xs text-muted-foreground backdrop-blur">
          <Sparkles className="size-3" /> New — v1.0
        </span>
        <h1 className="text-balance text-5xl font-bold tracking-tight md:text-6xl">
          Ship faster with composable slices
        </h1>
        <p className="mt-6 max-w-xl text-balance text-lg text-muted-foreground">
          Copy proven vertical slices, wire your bindings, and deploy in one command. No greenfield.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="#"
            className="inline-flex h-10 items-center gap-2 rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
          >
            Get started <ArrowRight className="size-4" />
          </Link>
          <Link
            href="#"
            className="inline-flex h-10 items-center gap-2 rounded-md border border-border/60 bg-background px-5 text-sm font-medium hover:bg-muted"
          >
            View docs
          </Link>
        </div>
      </section>
    </main>
  );
}
