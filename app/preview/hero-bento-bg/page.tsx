import Link from "next/link";
import { ArrowRight, Sparkles, Box, Zap, GitBranch, ShieldCheck, Rocket, Layers } from "lucide-react";

const TILES = [
  { Icon: Box, span: "col-span-2 row-span-2", g: "from-violet-500/30 to-fuchsia-500/10" },
  { Icon: Zap, span: "", g: "from-amber-500/30 to-amber-500/5" },
  { Icon: ShieldCheck, span: "", g: "from-emerald-500/30 to-emerald-500/5" },
  { Icon: GitBranch, span: "col-span-2", g: "from-sky-500/30 to-sky-500/5" },
  { Icon: Rocket, span: "", g: "from-pink-500/30 to-pink-500/5" },
  { Icon: Layers, span: "", g: "from-indigo-500/30 to-indigo-500/5" },
];

export default function Page() {
  return (
    <main className="relative isolate min-h-screen overflow-hidden bg-background">
      <div className="absolute inset-0 -z-10 grid grid-cols-4 grid-rows-3 gap-3 p-6 opacity-60 [mask-image:radial-gradient(circle_at_center,black,transparent_75%)]">
        {TILES.map(({ Icon, span, g }, i) => (
          <div
            key={i}
            className={`relative overflow-hidden rounded-2xl border border-border/40 bg-gradient-to-br ${g} ${span}`}
          >
            <Icon className="absolute right-4 top-4 size-7 text-foreground/60" />
          </div>
        ))}
      </div>
      <section className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center px-6 text-center">
        <span className="mb-6 inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-background/80 px-3 py-1 text-xs text-muted-foreground backdrop-blur">
          <Sparkles className="size-3" /> Bento background
        </span>
        <h1 className="bg-gradient-to-br from-foreground to-foreground/60 bg-clip-text text-5xl font-bold tracking-tight text-transparent md:text-6xl">
          The kitab for shipping
        </h1>
        <p className="mt-5 max-w-xl text-balance text-lg text-muted-foreground">
          A mesh of vertical slices, synced bidirectionally between consumers and the kitab.
        </p>
        <Link
          href="#"
          className="mt-8 inline-flex h-10 items-center gap-2 rounded-md bg-foreground px-6 text-sm font-medium text-background hover:bg-foreground/90"
        >
          Explore catalog <ArrowRight className="size-4" />
        </Link>
      </section>
    </main>
  );
}
