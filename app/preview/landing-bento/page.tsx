"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Sparkles, Zap, ShieldCheck, GitBranch, Rocket, Boxes, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const ICONS = [Boxes, ShieldCheck, Rocket, GitBranch, Sparkles, Zap, Boxes, ShieldCheck, Rocket];
const TITLES = [
  "Composable by design", "Audit-bp gated", "Ship in minutes",
  "Branchless flow", "Live previews", "Zero cold starts",
  "Convex first", "Type-safe end-to-end", "OKLch theme tokens",
];
const BODIES = [
  "Each slice flat. Drop in, wire SSOTs, ship.",
  "≥80 score before deploy.",
  "Convex + Dokploy first-class.",
  "Trunk-based + flag-gated.",
  "Iframe-mounted layouts.",
  "Reactive queries via Convex.",
  "One DB. Real-time everywhere.",
  "Zod + TanStack + Convex.",
  "Color-blind safe.",
];

const ACCENTS = {
  rainbow: [
    "from-violet-500/20 to-fuchsia-500/10",
    "from-emerald-500/20 to-emerald-500/5",
    "from-amber-500/20 to-amber-500/5",
    "from-sky-500/20 to-sky-500/5",
    "from-pink-500/20 to-pink-500/5",
    "from-yellow-500/20 to-yellow-500/5",
    "from-cyan-500/20 to-cyan-500/5",
    "from-orange-500/20 to-orange-500/5",
    "from-indigo-500/20 to-indigo-500/5",
  ],
  mono: Array(9).fill("from-violet-500/20 to-violet-500/5"),
  neutral: Array(9).fill("from-zinc-500/10 to-zinc-500/5"),
};

const SHAPES = {
  asym: ["md:col-span-2 md:row-span-2", "", "", "md:col-span-2", "", ""],
  "3x3": ["", "", "", "", "", "", "", "", ""],
  "2x2": ["", "", "", ""],
};

export default function Page() {
  return (
    <Suspense fallback={null}>
      <Inner />
    </Suspense>
  );
}

function Inner() {
  const p = useSearchParams();
  const variant = (p.get("variant") ?? "asym") as keyof typeof SHAPES;
  const tone = (p.get("tone") ?? "rainbow") as keyof typeof ACCENTS;
  const gradient = p.get("gradient") !== "0";
  const lift = p.get("lift") !== "0";
  const magnify = p.get("magnify") === "1";
  const ctaRow = p.get("ctaRow") === "1";

  const count = variant === "2x2" ? 4 : variant === "3x3" ? 9 : 6;
  const cols = variant === "2x2" ? "md:grid-cols-2" : "md:grid-cols-3";

  return (
    <main className="min-h-screen bg-background px-6 py-12">
      <div className="mx-auto max-w-6xl">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">Why kitab</p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight md:text-5xl">
          Built like Lego. Renders like SaaS.
        </h1>

        <div className={cn("mt-10 grid auto-rows-[170px] grid-cols-1 gap-4", cols)}>
          {Array.from({ length: count }).map((_, i) => {
            const Icon = ICONS[i % ICONS.length];
            const shape = SHAPES[variant][i] ?? "";
            return (
              <div
                key={i}
                className={cn(
                  "group relative overflow-hidden rounded-2xl border bg-card p-5 transition-all",
                  lift && "hover:-translate-y-0.5 hover:shadow-xl",
                  shape,
                )}
              >
                {gradient && (
                  <div className={cn("absolute inset-0 bg-gradient-to-br opacity-50 transition-opacity group-hover:opacity-80", ACCENTS[tone][i])} />
                )}
                <div className="relative flex h-full flex-col">
                  <Icon className={cn("size-5 text-foreground/80 transition-transform", magnify && "group-hover:scale-125")} />
                  <h3 className="mt-3 text-base font-semibold">{TITLES[i]}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{BODIES[i]}</p>
                  <span className="mt-auto text-xs text-muted-foreground/70">→</span>
                </div>
              </div>
            );
          })}
        </div>

        {ctaRow && (
          <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl border bg-card p-6">
            <div>
              <p className="font-semibold">Ready to ship?</p>
              <p className="text-sm text-muted-foreground">Copy the prompt → your agent does the rest.</p>
            </div>
            <button className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm text-primary-foreground hover:opacity-90">
              Get started <ArrowRight className="size-4" />
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
