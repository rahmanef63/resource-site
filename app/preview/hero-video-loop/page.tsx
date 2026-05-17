import Link from "next/link";
import { Play, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Page() {
  return (
    <main className="relative isolate min-h-screen overflow-hidden bg-zinc-950 text-white">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,theme(colors.violet.600/40),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,theme(colors.fuchsia.500/30),transparent_50%)]" />
        <div className="absolute inset-0 bg-[conic-gradient(from_120deg_at_50%_50%,theme(colors.violet.500/20),theme(colors.fuchsia.500/20),theme(colors.indigo.500/20),theme(colors.violet.500/20))] animate-[spin_30s_linear_infinite]" />
        <div className="absolute inset-0 bg-zinc-950/40" />
      </div>
      <section className="mx-auto flex min-h-screen max-w-4xl flex-col items-center justify-center px-6 py-24 text-center">
        <Button type="button" variant="ghost" className="mb-8 inline-flex size-14 items-center justify-center rounded-full border border-white/20 bg-white/10 backdrop-blur transition hover:bg-white/20 hover:text-white">
          <Play className="size-5 fill-white" />
        </Button>
        <h1 className="text-balance text-5xl font-bold tracking-tight md:text-7xl">
          Watch the platform in motion
        </h1>
        <p className="mt-6 max-w-2xl text-balance text-lg text-white/70">
          Real-time queries, bidirectional sync, audit-gated deploys — see how each slice composes.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Link href="#" className="inline-flex h-11 items-center gap-2 rounded-md bg-white px-6 text-sm font-medium text-zinc-950 hover:bg-white/90">
            Start the tour <ArrowRight className="size-4" />
          </Link>
          <Link href="#" className="inline-flex h-11 items-center rounded-md border border-white/20 px-6 text-sm hover:bg-white/10">
            Read docs
          </Link>
        </div>
      </section>
    </main>
  );
}
