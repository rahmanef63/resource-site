"use client";

import Link from "next/link";
import { ArrowLeft, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SEED_ARTICLES } from "../../shared/journal-seed";
import { PUBLIC_BASE } from "../../shared/nav-config";

const CATEGORY_LABEL: Record<string, string> = {
  "case-study": "Case study",
  essay: "Essay",
  "field-notes": "Field notes",
};

function formatDate(ts: number) {
  return new Date(ts).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/**
 * Journal detail — single article reader. Body splits on blank lines into
 * paragraphs (no Markdown dep). Related-article rail surfaces the next 3
 * articles in the same category.
 */
export function JournalDetailPage({ slug }: { slug: string }) {
  const article = SEED_ARTICLES.find((a) => a.slug === slug);

  if (!article) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-24 text-center">
        <h1 className="text-2xl font-semibold">Article not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">Slug: {slug}</p>
        <Button asChild variant="ghost" className="mt-6 gap-2">
          <Link href={`${PUBLIC_BASE}/journal`}><ArrowLeft className="size-4" /> Back to journal</Link>
        </Button>
      </div>
    );
  }

  const paragraphs = article.body.split(/\n\n+/).filter(Boolean);
  const related = SEED_ARTICLES.filter((a) => a.id !== article.id && a.category === article.category).slice(0, 3);

  return (
    <article className="mx-auto max-w-3xl px-6 py-16">
      <Button asChild variant="ghost" size="sm" className="mb-8 gap-2 text-muted-foreground">
        <Link href={`${PUBLIC_BASE}/journal`}><ArrowLeft className="size-4" /> Journal</Link>
      </Button>

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Badge variant="secondary" className="font-normal">{CATEGORY_LABEL[article.category]}</Badge>
        <span>·</span>
        <span>{formatDate(article.publishedAt)}</span>
        <span>·</span>
        <span className="inline-flex items-center gap-1"><Clock className="size-3" />{article.readMinutes} min read</span>
      </div>

      <h1 className="mt-4 text-3xl font-semibold tracking-tight md:text-4xl">{article.title}</h1>
      <p className="mt-4 text-lg text-muted-foreground">{article.excerpt}</p>
      <p className="mt-6 text-sm">By <span className="font-medium">{article.author}</span></p>

      {article.cover && (
        <div
          aria-hidden
          className="mt-10 aspect-[16/9] w-full rounded-lg border border-border bg-muted"
          style={{ backgroundImage: `url(${article.cover})`, backgroundSize: "cover", backgroundPosition: "center" }}
        />
      )}

      <div className="prose prose-neutral mt-10 max-w-none dark:prose-invert">
        {paragraphs.map((p, i) => (
          <p key={i} className="mb-5 text-base leading-relaxed text-foreground/90">{p}</p>
        ))}
      </div>

      {related.length > 0 && (
        <section className="mt-16 border-t border-border pt-10">
          <h2 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Related</h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-3">
            {related.map((r) => (
              <li key={r.id}>
                <Link
                  href={`${PUBLIC_BASE}/journal/${r.slug}`}
                  className="block rounded-md border border-border/60 p-4 transition-colors hover:border-foreground/40 hover:bg-muted/40"
                >
                  <p className="text-xs text-muted-foreground">{formatDate(r.publishedAt)}</p>
                  <p className="mt-1 text-sm font-medium">{r.title}</p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}
