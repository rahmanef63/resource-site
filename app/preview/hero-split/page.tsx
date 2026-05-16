import Link from "next/link";
import { ArrowRight, Boxes, GitBranch, ShieldCheck } from "lucide-react";

export default function Page() {
  return (
    <main className="min-h-screen bg-background">
      <section className="mx-auto grid min-h-screen max-w-7xl grid-cols-1 items-center gap-12 px-6 py-16 lg:grid-cols-2">
        <div>
          <span className="mb-4 inline-block rounded-full border border-border/60 bg-muted/40 px-3 py-1 text-xs font-medium text-muted-foreground">
            Built for engineering teams
          </span>
          <h1 className="text-balance text-4xl font-bold tracking-tight md:text-5xl">
            From idea to production, in hours not weeks
          </h1>
          <p className="mt-5 text-balance text-muted-foreground">
            Lift entire vertical slices — frontend + Convex backend + agent recipe — into any compatible project. Audit-gated, type-safe, real-time.
          </p>
          <ul className="mt-6 space-y-3 text-sm">
            <li className="flex items-center gap-2"><ShieldCheck className="size-4 text-emerald-500" /> Audit-bp gates every commit</li>
            <li className="flex items-center gap-2"><Boxes className="size-4 text-violet-500" /> 26 portable slices ready to drop in</li>
            <li className="flex items-center gap-2"><GitBranch className="size-4 text-sky-500" /> Self-hosted Convex + Dokploy</li>
          </ul>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="#" className="inline-flex h-10 items-center gap-2 rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground hover:bg-primary/90">
              Start free <ArrowRight className="size-4" />
            </Link>
            <Link href="#" className="inline-flex h-10 items-center rounded-md border border-border/60 px-5 text-sm hover:bg-muted">
              Book demo
            </Link>
          </div>
        </div>
        <div className="relative h-[420px] overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br from-violet-500/20 via-fuchsia-500/10 to-transparent">
          <div className="absolute inset-0 grid grid-cols-3 gap-2 p-4">
            {Array.from({ length: 9 }).map((_, i) => (
              <div
                key={i}
                className="rounded-lg border border-border/40 bg-background/40 backdrop-blur"
                style={{ opacity: 0.4 + (i % 3) * 0.2 }}
              />
            ))}
          </div>
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background to-transparent" />
        </div>
      </section>
    </main>
  );
}
