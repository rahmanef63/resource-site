import { POSTS, Thumb } from "../_blog/data";

export default function Page() {
  return (
    <main className="min-h-screen bg-background">
      <section className="mx-auto max-w-3xl px-6 py-16">
        <header className="mb-10">
          <h1 className="text-4xl font-bold tracking-tight">All posts</h1>
          <p className="mt-2 text-muted-foreground">Dense, scannable list view.</p>
        </header>
        <div className="divide-y divide-border/40">
          {POSTS.map((p) => (
            <article key={p.slug} className="group flex gap-5 py-6">
              <Thumb post={p} className="size-24 shrink-0 rounded-xl" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium">{p.tag}</span>
                  <span>·</span><span>{p.date}</span><span>·</span><span>{p.read}</span>
                </div>
                <h2 className="mt-1.5 text-lg font-semibold leading-snug group-hover:underline">{p.title}</h2>
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{p.excerpt}</p>
                <p className="mt-2 text-xs font-medium text-muted-foreground">by {p.author}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
