"use client";

import * as React from "react";
import { PortfolioListSection, PortfolioDetailView, type PortfolioItem } from "@/features/portfolio-section";
import { SlicePreviewLayout, PreviewSection } from "@/components/slice-previews/preview-layout";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const ITEMS: PortfolioItem[] = [
  {
    id: "1",
    slug: "northwave-redesign",
    title: "Northwave — fintech rebrand + product",
    summary: "End-to-end identity + mobile + dashboard for a Series B fintech.",
    body: "Northwave came to us mid-Series-B with a brand that felt indistinguishable from competitors and a dashboard their power users had outgrown.\n\nWe started with a 3-week discovery — 18 user interviews, competitor audit, brand archetype workshop. Then 6 weeks of identity work running parallel to a product redesign sprint.\n\nThe result: a 38% lift in feature activation, a 22% drop in support tickets about the dashboard, and a brand the founders are proud to put on their conference booth.",
    year: 2025,
    client: "Northwave Capital",
    role: "Design lead + frontend",
    tags: ["branding", "product", "fintech"],
    cover: { src: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1600&auto=format&fit=crop", alt: "Dashboard mockup on screen" },
    gallery: [
      { src: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&auto=format&fit=crop", alt: "Analytics view" },
      { src: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=1200&auto=format&fit=crop", alt: "Team workshop" },
    ],
    link: { label: "Visit northwave.com", href: "#" },
    sections: [
      { id: "p", heading: "Problem", body: "Brand undifferentiated, dashboard power-users complaining loudly." },
      { id: "a", heading: "Approach", body: "Identity sprint + product redesign in parallel, weekly stakeholder demo." },
      { id: "r", heading: "Result", body: "+38% activation, -22% support, brand featured in TechCrunch." },
    ],
  },
  {
    id: "2",
    slug: "quill-publishing",
    title: "Quill — editorial platform",
    summary: "Custom CMS + reader experience for a long-form publisher.",
    year: 2024,
    client: "Quill",
    tags: ["cms", "editorial"],
    cover: { src: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1600&auto=format&fit=crop", alt: "Open laptop with text editor" },
  },
  {
    id: "3",
    slug: "indigo-labs",
    title: "Indigo Labs — research tool",
    summary: "Internal tool for an AI research lab — vector search + collaborative annotation.",
    year: 2024,
    client: "Indigo Labs",
    tags: ["ai", "internal-tool"],
    cover: { src: "https://images.unsplash.com/photo-1531746790731-6c087fecd65a?w=1200&auto=format&fit=crop", alt: "Abstract data viz" },
  },
  {
    id: "4",
    slug: "refit-onboarding",
    title: "Refit — fitness onboarding",
    summary: "Mobile-first onboarding flow lifting day-7 retention by 19%.",
    year: 2024,
    client: "Refit",
    tags: ["mobile", "growth"],
    cover: { src: "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=1200&auto=format&fit=crop", alt: "Fitness app mockup" },
  },
  {
    id: "5",
    slug: "linear-forge",
    title: "Linear-Forge — devtool landing",
    summary: "Marketing site rebuild — Lighthouse 100, sub-second LCP.",
    year: 2023,
    client: "Linear-Forge",
    tags: ["marketing", "performance"],
    cover: { src: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1200&auto=format&fit=crop", alt: "Marketing site" },
  },
];

const LAYOUTS = ["uniform", "masonry", "asymmetric", "detail"] as const;

export default function Page() {
  const [layout, setLayout] = React.useState<(typeof LAYOUTS)[number]>("uniform");
  return (
    <SlicePreviewLayout title="Portfolio Section" kind="ui" maxWidth="none">
      <PreviewSection title="Live demo" hint={layout === "detail" ? "PortfolioDetailView with sections + gallery + related" : `PortfolioListSection layout="${layout}"`}>
        <div className="mb-4 inline-flex rounded-md border border-input p-0.5">
          {LAYOUTS.map((v) => (
            <Button
              key={v}
              variant="ghost"
              type="button"
              onClick={() => setLayout(v)}
              className={cn(
                "h-auto rounded px-3 py-1 text-xs capitalize",
                layout === v ? "bg-accent font-medium" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {v}
            </Button>
          ))}
        </div>

        {layout === "detail" ? (
          <PortfolioDetailView
            item={ITEMS[0]!}
            backHref="#"
            related={ITEMS.slice(1, 4)}
            hrefForRelated={(i) => `#${i.slug}`}
          />
        ) : (
          <PortfolioListSection
            eyebrow="Selected work"
            title="Portfolio"
            subtitle="Recent projects across branding, product, and devtools."
            items={ITEMS}
            hrefFor={(i) => `#${i.slug}`}
            layout={layout}
            columns={3}
          />
        )}
      </PreviewSection>
    </SlicePreviewLayout>
  );
}
