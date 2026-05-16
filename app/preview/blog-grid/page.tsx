import { POSTS, Thumb } from "../_blog/data";
import { ArrowRight } from "lucide-react";

export default function Page() {
  return (
    <main className="min-h-screen bg-background">
      <section className="mx-auto max-w-6xl px-6 py-16">
        <header className="mb-10 flex items-end justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Journal</h1>
            <p className="mt-2 text-muted-foreground">Notes from the kitab.</p>
          </div>
          <a href="#" className="text-sm font-medium hover:underline">View all <ArrowRight className="ml-1 inline size-3" /></a>
        </header>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {POSTS.map((p) => (
            <article key={p.slug} className="group rounded-2xl border border-border/60 bg-card transition hover:shadow-md">
              <Thumb post={p} className="h-44 rounded-t-2xl" />
              <div className="space-y-3 p-5">
                <h2 className="text-lg font-semibold leading-snug group-hover:underline">{p.title}</h2>
                <p className="line-clamp-2 text-sm text-muted-foreground">{p.excerpt}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{p.author}</span>·<span>{p.date}</span>·<span>{p.read}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
