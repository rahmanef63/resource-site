"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowRight,
  Bug,
  CalendarDays,
  Rss,
  Sparkles,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useChangelog } from "../../shared/store";
import { PUBLIC_BASE } from "../../shared/nav-config";
import type { ChangelogEntry } from "../../shared/types";

const KIND_META: Record<
  ChangelogEntry["kind"],
  { label: string; tone: "default" | "outline" | "secondary"; icon: LucideIcon }
> = {
  feature: { label: "Feature", tone: "default",   icon: Sparkles },
  fix:     { label: "Fix",     tone: "outline",   icon: Bug },
  chore:   { label: "Chore",   tone: "secondary", icon: Wrench },
};

const MONTH_FMT = new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" });

function semverBucket(version: string): "major" | "minor" | "patch" {
  const m = /^v?(\d+)\.(\d+)\.(\d+)/.exec(version);
  if (!m) return "patch";
  const [, , minor, patch] = m;
  if (Number(patch) > 0) return "patch";
  if (Number(minor) > 0) return "minor";
  return "major";
}

const BUCKET_TONE: Record<ReturnType<typeof semverBucket>, "default" | "outline" | "secondary"> = {
  major: "default",
  minor: "outline",
  patch: "secondary",
};

/**
 * CK-2B expansion.
 *
 * Groups changelog entries by month and renders each as a Card. Per-entry
 * row shows version badge (tone derived from semver level), kind icon,
 * relative + absolute date, and body. Adds an RSS hint + back-to-blog
 * link in the page footer.
 */
export function ChangelogPage() {
  const entries = useChangelog();

  const grouped = React.useMemo(() => {
    const sorted = [...entries].sort((a, b) => b.date - a.date);
    const map = new Map<string, ChangelogEntry[]>();
    for (const e of sorted) {
      const key = MONTH_FMT.format(new Date(e.date));
      const arr = map.get(key) ?? [];
      arr.push(e);
      map.set(key, arr);
    }
    return [...map.entries()];
  }, [entries]);

  return (
    <section>
      <div className="mx-auto max-w-4xl px-6 pt-12 pb-20">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
              Changelog
            </p>
            <h1 className="mt-2 text-4xl font-semibold tracking-tight">What we shipped</h1>
            <p className="mt-2 max-w-xl text-muted-foreground">
              Every release in reverse-chronological order. We ship every week.
            </p>
          </div>
          <Button asChild variant="outline" size="sm" className="gap-2">
            <Link href={`${PUBLIC_BASE}/changelog/rss.xml`}>
              <Rss className="size-3.5" /> RSS
            </Link>
          </Button>
        </div>

        <div className="space-y-10">
          {grouped.map(([month, items]) => (
            <section key={month}>
              <div className="mb-3 flex items-center gap-3">
                <CalendarDays className="size-4 text-muted-foreground" />
                <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  {month}
                </h2>
                <span className="text-[11px] font-mono text-muted-foreground">
                  {items.length} release{items.length > 1 ? "s" : ""}
                </span>
                <div className="h-px flex-1 bg-border/40" />
              </div>
              <div className="space-y-3">
                {items.map((e) => {
                  const meta = KIND_META[e.kind] ?? KIND_META.chore;
                  const Icon = meta.icon;
                  const bucket = semverBucket(e.version);
                  return (
                    <Card key={e.id} className="border-border/60 bg-card/60">
                      <CardContent className="p-5">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge
                            variant={BUCKET_TONE[bucket]}
                            className="rounded-full font-mono text-[10px] uppercase"
                          >
                            {e.version}
                          </Badge>
                          <Badge variant={meta.tone} className="rounded-full gap-1 text-[10px]">
                            <Icon className="size-3" /> {meta.label}
                          </Badge>
                          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                            {bucket}
                          </span>
                          <span className="ml-auto font-mono text-[11px] text-muted-foreground tabular-nums">
                            {new Date(e.date).toISOString().slice(0, 10)}
                          </span>
                        </div>
                        <h3 className="mt-3 text-base font-semibold tracking-tight">{e.title}</h3>
                        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                          {e.body}
                        </p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </section>
          ))}
        </div>

        <div className="mt-16 rounded-xl border border-border/60 bg-muted/20 p-6 text-center">
          <p className="text-sm text-muted-foreground">
            Want the &ldquo;why&rdquo; behind these releases?
          </p>
          <Button asChild variant="ghost" className="mt-2">
            <Link href={`${PUBLIC_BASE}/blog`}>
              Read engineering deep-dives <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
