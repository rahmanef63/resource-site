"use client";

import * as React from "react";
import { Search, Sparkles, ArrowUp } from "lucide-react";
import { PreviewPage, PreviewContainer, BlogThumb, hueFromString } from "@/components/site/preview-kit";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

const SOURCES = [
  { id: 1, title: "Self-hosting Convex on Dokploy", url: "kitab.dev/blog/convex-self-host", domain: "kitab.dev" },
  { id: 2, title: "Convex docker-compose template", url: "github.com/get-convex/convex-backend", domain: "github.com" },
  { id: 3, title: "Caddy auto-HTTPS for Convex", url: "docs.convex.dev/self-hosting/networking", domain: "docs.convex.dev" },
  { id: 4, title: "ADR-007: Backend hosting choice", url: "kitab.dev/adr/007", domain: "kitab.dev" },
];

const FOLLOW_UPS = [
  "How much RAM does the backend need?",
  "Can I add a read replica?",
  "How do I migrate from Convex cloud?",
];

export default function Page() {
  const [q, setQ] = React.useState("How do I self-host Convex with Dokploy?");
  return (
    <PreviewPage>
      <PreviewContainer size="reading">
        <header className="space-y-4 pb-6">
          <div className="flex items-center gap-2">
            <Sparkles className="size-4 text-primary" />
            <span className="text-sm font-semibold">Ask</span>
            <Badge variant="secondary" className="text-[10px]">workspace · acme</Badge>
          </div>
          <h1 className="text-balance text-2xl font-bold tracking-tight sm:text-3xl">{q}</h1>
          <div className="flex flex-wrap gap-2 overflow-x-auto pb-2">
            {SOURCES.map((s) => {
              const hue = hueFromString(s.domain);
              return (
                <Card key={s.id} className="flex w-44 shrink-0 gap-2 p-2.5 transition hover:border-primary/40">
                  <BlogThumb
                    post={{ slug: String(s.id), title: s.title, excerpt: "", tag: "", author: "", date: "", read: "", hue }}
                    className="size-8 shrink-0 rounded-md"
                    showTag={false}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-[11px] font-medium leading-tight">{s.title}</p>
                    <p className="mt-0.5 truncate font-mono text-[10px] text-muted-foreground">{s.domain}</p>
                  </div>
                </Card>
              );
            })}
          </div>
        </header>

        <ScrollArea>
          <article className="prose prose-sm dark:prose-invert max-w-none space-y-3 pb-8 text-sm leading-relaxed">
            <p>
              Self-hosting Convex on Dokploy takes three pieces<sup className="ml-0.5 text-primary">[1]</sup>:
              the open-source backend image, an env file for the deploy key + database URL, and a Caddy
              auto-HTTPS reverse proxy in front<sup className="ml-0.5 text-primary">[3]</sup>.
            </p>
            <h2 className="text-base font-semibold">1. Pull the docker-compose template</h2>
            <p>
              The official <code className="rounded bg-muted px-1 text-[11px]">convex-backend</code> image
              ships a tested compose file<sup className="ml-0.5 text-primary">[2]</sup> with Postgres
              attached. Drop it into Dokploy as a new compose service.
            </p>
            <h2 className="text-base font-semibold">2. Set env vars</h2>
            <p>
              Required: <code className="rounded bg-muted px-1 text-[11px]">CONVEX_INSTANCE_NAME</code>,{" "}
              <code className="rounded bg-muted px-1 text-[11px]">CONVEX_INSTANCE_SECRET</code>,{" "}
              <code className="rounded bg-muted px-1 text-[11px]">DATABASE_URL</code>. The kitab's
              ADR-007<sup className="ml-0.5 text-primary">[4]</sup> documents the secret-rotation flow.
            </p>
            <h2 className="text-base font-semibold">3. Wire HTTPS</h2>
            <p>
              Caddy fronts the three subdomains (api-, site-, dash-) and handles ACME automatically.
              Total spin-up: under 8 minutes on a $6 VPS.
            </p>
          </article>
        </ScrollArea>

        <section className="mt-2 space-y-2 border-t border-border/40 pt-4">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Follow-up
          </p>
          <div className="flex flex-wrap gap-1.5">
            {FOLLOW_UPS.map((f) => (
              <Badge
                key={f}
                variant="outline"
                className="h-7 cursor-pointer rounded-full px-3 text-[11px] font-normal hover:bg-accent"
                onClick={() => setQ(f)}
              >
                {f}
              </Badge>
            ))}
          </div>
        </section>

        <div className="sticky bottom-4 mt-6 flex items-center gap-2 rounded-2xl border border-border/60 bg-background/95 px-3 py-2 shadow-lg backdrop-blur">
          <Search className="size-4 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Ask anything…"
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          <Button size="icon" className="size-7"><ArrowUp className="size-3.5" /></Button>
        </div>
      </PreviewContainer>
    </PreviewPage>
  );
}
