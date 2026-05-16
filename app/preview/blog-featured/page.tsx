import { POSTS, Thumb } from "../_blog/data";
import { ArrowRight } from "lucide-react";

export default function Page() {
  const [hero, ...rest] = POSTS;
  return (
    <main className="min-h-screen bg-background">
      <section className="relative overflow-hidden border-b border-border/60">
        <Thumb post={hero} className="absolute inset-0" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
        <div className="relative mx-auto flex min-h-[420px] max-w-5xl flex-col justify-end px-6 py-12">
          <span className="text-xs font-semibold uppercase tracking-wider text-primary">{hero.tag}</span>
          <h1 className="mt-3 max-w-3xl text-balance text-5xl font-bold leading-tight tracking-tight md:text-6xl">{hero.title}</h1>
          <p className="mt-4 max-w-2xl text-lg text-muted-foreground">{hero.excerpt}</p>
          <div className="mt-6 flex items-center gap-3 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{hero.author}</span>
            <span>·</span><span>{hero.date}</span>
            <span>·</span><span>{hero.read}</span>
            <a href="#" className="ml-auto inline-flex items-center gap-1 text-sm font-medium text-foreground hover:underline">
              Read story <ArrowRight className="size-4" />
            </a>
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-5xl px-6 py-14">
        <h2 className="mb-6 text-xs font-semibold uppercase tracking-wider text-muted-foreground">More from the journal</h2>
        <div className="grid gap-5 md:grid-cols-2">
          {rest.map((p) => (
            <article key={p.slug} className="group flex gap-4 rounded-xl border border-border/60 bg-card p-4 transition hover:shadow-md">
              <Thumb post={p} className="size-20 shrink-0 rounded-lg" />
              <div className="min-w-0">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-primary">{p.tag}</span>
                <h3 className="mt-1 text-sm font-semibold leading-snug group-hover:underline">{p.title}</h3>
                <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{p.excerpt}</p>
                <p className="mt-1 text-[10px] text-muted-foreground">{p.date} · {p.read}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
