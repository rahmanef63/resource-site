"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, CalendarDays, Mail, Mic, Sparkles, Wand2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SectionHead } from "@/components/templates/_shared/ui/section-head";
import { useContents, useNewsletters } from "../../shared/store";
import { ADMIN_BASE, PUBLIC_BASE } from "../../shared/nav-config";

const FEATURES = [
  { icon: CalendarDays, title: "Multi-channel Planner", blurb: "Plan IG, TikTok, YouTube, newsletter dari satu calendar." },
  { icon: Mic,          title: "Voice Trainer",         blurb: "Train AI dengan brand voice kamu — do/don't examples." },
  { icon: Wand2,        title: "Repurposing Engine",    blurb: "1 long-form → 5 shorts, 3 carousel, 1 newsletter otomatis." },
  { icon: Mail,         title: "Newsletter Native",     blurb: "Compose, schedule, ukur open rate — semua in-app." },
];

export function HomePage() {
  const newsletters = useNewsletters().filter((n) => n.status === "sent").slice(0, 3);
  const contents = useContents().filter((c) => c.status === "published").slice(0, 3);
  return (
    <>
      <Hero />
      <FeatureGrid />
      <NewsletterArchive issues={newsletters} />
      <RecentPosts items={contents} />
    </>
  );
}

function Hero() {
  return (
    <section className="relative isolate overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background" />
        <div className="absolute -right-40 top-32 h-96 w-96 rounded-full bg-fuchsia-500/15 blur-3xl" />
        <div className="absolute -left-40 bottom-0 h-96 w-96 rounded-full bg-amber-500/10 blur-3xl" />
      </div>
      <div className="mx-auto max-w-6xl px-6 pt-24 pb-28 md:pt-32 md:pb-36">
        <Badge variant="secondary" className="rounded-full px-3 py-1 text-[11px]">
          <Sparkles className="mr-1 size-3" /> Issue mingguan untuk creator
        </Badge>
        <h1 className="mt-6 max-w-4xl text-4xl font-semibold leading-[1.05] tracking-tight md:text-6xl">
          Newsletter & content notes untuk creator yang serius.
        </h1>
        <p className="mt-5 max-w-2xl text-lg text-muted-foreground md:text-xl">
          Tiap minggu — strategi konten, breakdown viral hits, dan template yang bisa kamu pakai langsung.
        </p>
        <form className="mt-8 flex max-w-md flex-wrap gap-2">
          <Input type="email" placeholder="email@kamu.com" className="flex-1 min-w-[200px]" />
          <Button size="lg" type="button">Subscribe <ArrowRight className="size-4" /></Button>
        </form>
        <p className="mt-3 text-xs text-muted-foreground">
          12K subscribers · 38% avg open rate · gratis selamanya
        </p>
        <div className="mt-12 flex gap-3">
          <Button variant="outline" asChild>
            <Link href={`${PUBLIC_BASE}/posts`}>Lihat archive</Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href={ADMIN_BASE}>Buka workspace</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

function FeatureGrid() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-20">
      <SectionHead
        eyebrow="Workspace"
        title="Apa yang ada di balik newsletter ini"
        subtitle="Workspace kreator yang sama saya pakai untuk produce content tiap minggu."
      />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {FEATURES.map((f) => {
          const Icon = f.icon;
          return (
            <Card key={f.title} className="border-border/60 bg-card/60">
              <CardContent className="p-6">
                <Icon className="size-5 text-foreground/80" />
                <h3 className="mt-4 text-base font-medium">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{f.blurb}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}

function NewsletterArchive({ issues }: { issues: ReturnType<typeof useNewsletters> }) {
  return (
    <section className="border-y border-border/50 bg-muted/10">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <SectionHead
          eyebrow="Newsletter"
          title="Issue terbaru"
          subtitle="Klik untuk baca arsip lengkap."
          cta={{ label: "Semua issue", href: `${PUBLIC_BASE}/posts` }}
        />
        <div className="grid gap-4 md:grid-cols-3">
          {issues.map((n) => (
            <Card key={n.id} className="border-border/60 bg-card/60">
              <CardContent className="space-y-2 p-5">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{n.status === "sent" ? "Terkirim" : "Akan datang"}</p>
                <h3 className="text-base font-medium leading-snug">{n.subject}</h3>
                <p className="text-sm text-muted-foreground">{n.preview}</p>
                <p className="pt-2 text-[11px] text-muted-foreground">
                  {n.recipients.toLocaleString()} recipients · {n.openRate.toFixed(1)}% open rate
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function RecentPosts({ items }: { items: ReturnType<typeof useContents> }) {
  return (
    <section className="mx-auto max-w-6xl px-6 py-20">
      <SectionHead
        eyebrow="Content"
        title="Highlight social posts"
        subtitle="Yang paling resonance bulan ini di IG, TikTok, dan YouTube."
      />
      <div className="grid gap-4 md:grid-cols-3">
        {items.map((c) => (
          <Card key={c.id} className="border-border/60 bg-card/60">
            <CardContent className="space-y-2 p-5">
              <Badge variant="outline" className="rounded-full text-[10px] capitalize">{c.channel}</Badge>
              <h3 className="text-sm font-medium leading-snug">{c.title}</h3>
              <p className="text-xs text-muted-foreground">{c.hook}</p>
              <p className="pt-2 text-[11px] text-muted-foreground">
                {c.views.toLocaleString()} views · {c.likes.toLocaleString()} likes
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
