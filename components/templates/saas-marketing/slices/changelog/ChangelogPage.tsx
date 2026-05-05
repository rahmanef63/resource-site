"use client";

import { Badge } from "@/components/ui/badge";
import { SectionHead } from "@/components/templates/_shared/ui/section-head";
import { fmtDate, useChangelog } from "../../shared/store";

const KIND_COLOR: Record<string, string> = {
  feature: "border-emerald-500/40 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  fix:     "border-blue-500/40 bg-blue-500/15 text-blue-700 dark:text-blue-300",
  chore:   "border-zinc-500/40 bg-zinc-500/15 text-zinc-700 dark:text-zinc-300",
};

export function ChangelogPage() {
  const entries = useChangelog();
  return (
    <section>
      <div className="mx-auto max-w-3xl px-6 py-20">
        <SectionHead
          eyebrow="Changelog"
          title="What's shipped"
          subtitle="Every release, in reverse chronological order."
        />
        <ol className="mt-12 space-y-10">
          {entries.map((e) => (
            <li key={e.id} className="grid gap-3 md:grid-cols-[120px_1fr] md:gap-6">
              <div>
                <p className="font-mono text-sm">{e.version}</p>
                <p className="text-xs text-muted-foreground">{fmtDate(e.date)}</p>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={`rounded-full text-[10px] ${KIND_COLOR[e.kind] ?? ""}`}>
                    {e.kind}
                  </Badge>
                  <h3 className="text-base font-medium">{e.title}</h3>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{e.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
