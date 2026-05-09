"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, CalendarDays, Mail, Mic, Wand2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  HeroBlock,
  SectionHead,
  FeatureGrid,
  type FeatureItem,
} from "@/components/templates/_shared";
import { useContents, useNewsletters } from "../../shared/store";
import { ADMIN_BASE, PUBLIC_BASE } from "../../shared/nav-config";

const FEATURES: FeatureItem[] = [
  { icon: CalendarDays, title: "Multi-channel Planner", blurb: "Plan IG, TikTok, YouTube, newsletter dari satu calendar." },
  { icon: Mic, title: "Voice Trainer", blurb: "Train AI dengan brand voice kamu — do/don't examples." },
  { icon: Wand2, title: "Repurposing Engine", blurb: "1 long-form → 5 shorts, 3 carousel, 1 newsletter otomatis." },
  { icon: Mail, title: "Newsletter Native", blurb: "Compose, schedule, ukur open rate — semua in-app." },
];

export function HomePage() {
  const newsletters = useNewsletters().filter((n) => n.status === "sent").slice(0, 3);
  const contents = useContents().filter((c) => c.status === "published").slice(0, 3);
  return (
    <>
      <HeroBlock
        glow
        badge="Issue mingguan untuk creator"
        title="Newsletter & content notes untuk creator yang serius."
        subtitle="Tiap minggu — strategi konten, breakdown viral hits, dan template yang bisa kamu pakai langsung."
      >
      </HeroBlock>

      {/* Newsletter signup strip — kreator-specific extra below the hero */}
      <section className="border-b border-border/60 bg-muted/10">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <p className="text-sm font-medium">12K subscribers · 38% avg open rate · gratis selamanya</p>
            <p className="text-xs text-muted-foreground">Subscribe untuk dapat tiap edisi.</p>
          </div>
          <form className="flex flex-wrap gap-2 sm:max-w-md">
            <Input type="email" placeholder="email@kamu.com" className="min-w-[200px] flex-1" />
            <Button size="default" type="button">
              Subscribe <ArrowRight className="size-4" />
            </Button>
          </form>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <SectionHead
          eyebrow="Workspace"
          title="Apa yang ada di balik newsletter ini"
          subtitle="Workspace kreator yang sama saya pakai untuk produce content tiap minggu."
          cta={{ label: "Buka workspace", href: ADMIN_BASE }}
        />
        <FeatureGrid items={FEATURES} columns={4} className="mt-10" />
      </section>

      <section className="border-y border-border/50 bg-muted/10">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <SectionHead
            eyebrow="Newsletter"
            title="Issue terbaru"
            subtitle="Klik untuk baca arsip lengkap."
            cta={{ label: "Semua issue", href: `${PUBLIC_BASE}/posts` }}
          />
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {newsletters.map((n) => (
              <Card key={n.id} className="border-border/60 bg-card/60">
                <CardContent className="space-y-2 p-5">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    {n.status === "sent" ? "Terkirim" : "Akan datang"}
                  </p>
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

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <SectionHead
          eyebrow="Content"
          title="Highlight social posts"
          subtitle="Yang paling resonance bulan ini di IG, TikTok, dan YouTube."
        />
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {contents.map((c) => (
            <Card key={c.id} className="border-border/60 bg-card/60">
              <CardContent className="space-y-2 p-5">
                <Badge variant="outline" className="rounded-full text-[10px] capitalize">
                  {c.channel}
                </Badge>
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
    </>
  );
}
