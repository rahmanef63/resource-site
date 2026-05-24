"use client";

import Link from "next/link";
import { ArrowRight, BookOpen, CalendarDays } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { fmtDate, usePosts } from "../../shared/store";
import { PUBLIC_BASE } from "../../shared/nav-config";
import { BlogList } from "./BlogList";
import { BlogSidebar } from "./BlogSidebar";

/**
 * CK-2B expansion.
 *
 * Two-column blog index: hero card highlights the most recent post,
 * mid-section delegates to the canonical BlogList (admin-editable, live),
 * right rail is BlogSidebar (tags, authors, newsletter, RSS). Footer
 * editorial pitch links into /about. Pre-existing BlogList component
 * unchanged so the shared slice contract holds.
 */
export function BlogPage() {
  const posts = usePosts();
  const published = posts
    .filter((p) => p.status !== "draft")
    .sort((a, b) => b.publishedAt - a.publishedAt);
  const featured = published[0];

  return (
    <section>
      <div className="mx-auto max-w-6xl px-6 pt-12 pb-20">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
              Writing
            </p>
            <h1 className="mt-2 text-4xl font-semibold tracking-tight">From the team</h1>
            <p className="mt-2 max-w-xl text-muted-foreground">
              Engineering deep-dives, customer stories, and product thinking — written
              by the people who shipped the feature.
            </p>
          </div>
          <Button asChild variant="outline" size="sm" className="gap-2">
            <Link href={`${PUBLIC_BASE}/about`}>
              About the writers <ArrowRight className="size-3.5" />
            </Link>
          </Button>
        </div>

        {featured && (
          <Card className="mb-10 overflow-hidden border-border/60 bg-gradient-to-br from-violet-500/10 via-card/60 to-indigo-500/10">
            <CardContent className="grid gap-6 p-6 md:grid-cols-2 md:p-10">
              <div className="grid h-48 place-items-center rounded-xl bg-gradient-to-br from-violet-500/20 via-indigo-500/15 to-amber-500/10 text-6xl">
                <BookOpen className="size-12 text-foreground/40" />
              </div>
              <div className="flex flex-col justify-center">
                <Badge variant="default" className="w-fit rounded-full text-[10px]">
                  Featured
                </Badge>
                <h2 className="mt-3 text-2xl font-semibold tracking-tight md:text-3xl">
                  {featured.title}
                </h2>
                <p className="mt-3 text-sm text-muted-foreground">{featured.excerpt}</p>
                <div className="mt-4 flex items-center gap-3 text-xs text-muted-foreground">
                  <CalendarDays className="size-3.5" />
                  <span className="tabular-nums">{fmtDate(featured.publishedAt)}</span>
                  <span>·</span>
                  <span>{featured.author}</span>
                  {featured.tags.slice(0, 2).map((t) => (
                    <Badge key={t} variant="outline" className="rounded-full text-[10px]">
                      {t}
                    </Badge>
                  ))}
                </div>
                <Button asChild className="mt-5 w-fit">
                  <Link href={`${PUBLIC_BASE}/blog/${featured.slug}`}>
                    Read post <ArrowRight className="size-4" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-10 lg:grid-cols-[1fr_280px]">
          <div>
            <BlogList />
          </div>
          <BlogSidebar />
        </div>
      </div>
    </section>
  );
}
