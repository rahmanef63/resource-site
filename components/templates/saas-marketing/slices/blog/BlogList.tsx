"use client";

import Link from "next/link";
import { SectionHead } from "@/components/templates/_shared/ui/section-head";
import { Badge } from "@/components/ui/badge";
import { fmtDate, usePosts } from "../../shared/store";
import { PUBLIC_BASE } from "../../shared/nav-config";

export function BlogList() {
  const posts = usePosts();
  return (
    <section>
      <div className="mx-auto max-w-5xl px-6 py-20">
        <SectionHead
          eyebrow="Blog"
          title="From the team"
          subtitle="Engineering deep-dives, customer stories, and product thinking."
        />
        <div className="mt-12 divide-y divide-border/60 border-y border-border/60">
          {posts.map((p) => (
            <Link
              key={p.id}
              href={`${PUBLIC_BASE}/blog/${p.slug}`}
              className="grid gap-4 py-6 md:grid-cols-[120px_1fr] md:gap-8"
            >
              <div className="text-xs text-muted-foreground">{fmtDate(p.publishedAt)}</div>
              <div>
                <h3 className="text-lg font-medium hover:underline">{p.title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{p.excerpt}</p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span className="text-[11px] text-muted-foreground">{p.author}</span>
                  {p.tags.map((t) => (
                    <Badge key={t} variant="outline" className="rounded-full text-[9px]">{t}</Badge>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
