"use client";

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
import { LandingSectionShell } from "@/components/templates/_shared/landing/LandingSectionShell";
import { parseConfigBadge } from "@/components/templates/_shared/landing/parse-config";
import type { LandingSection } from "@/components/templates/_shared/landing/types";
import { ADMIN_BASE, PUBLIC_BASE } from "../../shared/nav-config";
import type { ContentItem, NewsletterIssue } from "../../shared/types";

interface Deps {
  contents: ContentItem[];
  newsletters: NewsletterIssue[];
}

const FEATURE_ITEMS: FeatureItem[] = [
  { icon: CalendarDays, title: "Multi-channel Planner", blurb: "Plan IG, TikTok, YouTube, newsletter dari satu calendar." },
  { icon: Mic, title: "Voice Trainer", blurb: "Train AI dengan brand voice kamu — do/don't examples." },
  { icon: Wand2, title: "Repurposing Engine", blurb: "1 long-form → 5 shorts, 3 carousel, 1 newsletter otomatis." },
  { icon: Mail, title: "Newsletter Native", blurb: "Compose, schedule, ukur open rate — semua in-app." },
];

/**
 * Maps each enabled landingSection.kind to its kreator-studio renderer.
 * Admin-editable title/subtitle thread through; unknown kinds render a
 * minimal stub so admin still sees them without crashing the page.
 */
export function renderLanding(section: LandingSection, deps: Deps) {
  switch (section.kind) {
    case "hero":
      return (
        <LandingSectionShell section={section}>
          <HeroBlock
            glow
            badge={parseConfigBadge(section.config) ?? "Issue mingguan untuk creator"}
            title={section.title}
            subtitle={section.subtitle}
            image={section.imageUrl ? { url: section.imageUrl, ratio: section.imageRatio } : undefined}
          />
        </LandingSectionShell>
      );

    case "newsletter":
      return (
        <LandingSectionShell section={section} defaultClassName="border-b border-border/60 bg-muted/10">
          <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div>
              <p className="text-sm font-medium">{section.title}</p>
              {section.subtitle ? (
                <p className="text-xs text-muted-foreground">{section.subtitle}</p>
              ) : null}
            </div>
            <form className="flex flex-wrap gap-2 sm:max-w-md">
              <Input type="email" placeholder="email@kamu.com" className="min-w-[200px] flex-1" />
              <Button size="default" type="button">
                Subscribe <ArrowRight className="size-4" />
              </Button>
            </form>
          </div>
        </LandingSectionShell>
      );

    case "features":
      return (
        <LandingSectionShell section={section} defaultClassName="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <SectionHead
            eyebrow="Workspace"
            title={section.title}
            subtitle={section.subtitle}
            cta={{ label: "Buka workspace", href: ADMIN_BASE }}
          />
          <FeatureGrid items={FEATURE_ITEMS} columns={4} className="mt-10" />
        </LandingSectionShell>
      );

    case "blog": {
      const items = deps.newsletters.filter((n) => n.status === "sent").slice(0, 3);
      return (
        <LandingSectionShell section={section} defaultClassName="border-y border-border/50 bg-muted/10">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
            <SectionHead
              eyebrow="Newsletter"
              title={section.title}
              subtitle={section.subtitle}
              cta={{ label: "Semua issue", href: `${PUBLIC_BASE}/posts` }}
            />
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((n) => (
                <Card key={n.id} className="border-border/60 bg-card/60">
                  <CardContent className="space-y-2 p-5">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      Terkirim
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
        </LandingSectionShell>
      );
    }

    case "portfolio": {
      const items = deps.contents.filter((c) => c.status === "published").slice(0, 3);
      return (
        <LandingSectionShell section={section} defaultClassName="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <SectionHead
            eyebrow="Content"
            title={section.title}
            subtitle={section.subtitle}
          />
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((c) => (
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
        </LandingSectionShell>
      );
    }

    case "stats":
    case "services":
    case "pricing":
    case "changelog":
    case "testimonials":
    case "faq":
    case "cta":
    case "custom":
      return (
        <LandingSectionShell
          section={section}
          defaultClassName="border-b border-border/40 bg-muted/10 py-12"
        >
          <div className="mx-auto max-w-3xl px-6 text-center">
            <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
              {section.kind}
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">{section.title}</h2>
            {section.subtitle ? (
              <p className="mt-3 text-sm text-muted-foreground">{section.subtitle}</p>
            ) : null}
          </div>
        </LandingSectionShell>
      );

    default:
      return null;
  }
}

