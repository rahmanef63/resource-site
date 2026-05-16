import { POSTS, Thumb } from "../_blog/data";

const HEIGHTS = ["h-56", "h-72", "h-48", "h-80", "h-60", "h-44"];

export default function Page() {
  return (
    <main className="min-h-screen bg-background">
      <section className="mx-auto max-w-6xl px-6 py-16">
        <header className="mb-10">
          <h1 className="text-4xl font-bold tracking-tight">Field notes</h1>
          <p className="mt-2 text-muted-foreground">Irregular grid. Eye flows.</p>
        </header>
        <div className="columns-1 gap-6 sm:columns-2 lg:columns-3">
          {POSTS.map((p, i) => (
            <article key={p.slug} className="group mb-6 break-inside-avoid rounded-2xl border border-border/60 bg-card transition hover:shadow-md">
              <Thumb post={p} className={`${HEIGHTS[i % HEIGHTS.length]} rounded-t-2xl`} />
              <div className="space-y-2 p-5">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-primary">{p.tag}</span>
                <h2 className="text-lg font-semibold leading-snug group-hover:underline">{p.title}</h2>
                <p className="text-sm text-muted-foreground">{p.excerpt}</p>
                <p className="text-[10px] text-muted-foreground">{p.author} · {p.read}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
