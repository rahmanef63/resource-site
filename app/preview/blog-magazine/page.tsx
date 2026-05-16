import { POSTS, Thumb } from "../_blog/data";

export default function Page() {
  const [hero, ...rest] = POSTS;
  const [secondary, ...tail] = rest;
  return (
    <main className="min-h-screen bg-background">
      <section className="mx-auto max-w-7xl px-6 py-16">
        <header className="mb-10 flex items-end justify-between border-b border-border/60 pb-6">
          <h1 className="text-4xl font-bold tracking-tight">The Kitab Quarterly</h1>
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Issue 02 — Q2 2026</p>
        </header>
        <div className="grid gap-8 lg:grid-cols-3">
          <article className="lg:col-span-2">
            <Thumb post={hero} className="h-96 rounded-2xl" />
            <div className="mt-5 max-w-2xl">
              <span className="text-xs font-semibold uppercase tracking-wider text-primary">{hero.tag}</span>
              <h2 className="mt-2 text-4xl font-bold leading-tight hover:underline">{hero.title}</h2>
              <p className="mt-3 text-lg text-muted-foreground">{hero.excerpt}</p>
              <p className="mt-3 text-xs text-muted-foreground">{hero.author} · {hero.date} · {hero.read}</p>
            </div>
          </article>
          <aside className="space-y-6">
            <article className="border-b border-border/60 pb-6">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Featured</span>
              <Thumb post={secondary} className="mt-2 h-32 rounded-xl" />
              <h3 className="mt-3 text-lg font-semibold leading-snug hover:underline">{secondary.title}</h3>
              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{secondary.excerpt}</p>
            </article>
            <div className="space-y-4">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">More reading</p>
              {tail.map((p) => (
                <article key={p.slug} className="border-b border-border/30 pb-3 last:border-0">
                  <span className="text-[10px] font-medium uppercase tracking-wider text-primary">{p.tag}</span>
                  <h4 className="mt-1 text-sm font-semibold leading-snug hover:underline">{p.title}</h4>
                  <p className="mt-1 text-[10px] text-muted-foreground">{p.date} · {p.read}</p>
                </article>
              ))}
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
