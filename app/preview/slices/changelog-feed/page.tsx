"use client";

import * as React from "react";
import { ChangelogFeedSection, type ChangelogEntry } from "@/features/changelog-feed";
import { SlicePreviewLayout, PreviewSection } from "@/components/slice-previews/preview-layout";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const ENTRIES: ChangelogEntry[] = [
  {
    id: "1",
    version: "1.7.0",
    date: Date.now() - 86_400_000 * 1,
    kind: "feature",
    title: "Seven new canonical UI slices + slot extensions",
    body: "Major release — every marketing template now consumes shared slices.",
    bullets: [
      "pricing-page, feature-grid, faq-section",
      "testimonials-grid, blog-section, changelog-feed",
      "portfolio-section with masonry + asymmetric layouts",
    ],
  },
  {
    id: "2",
    version: "1.6.1",
    date: Date.now() - 86_400_000 * 4,
    kind: "improvement",
    title: "ThreeColumn — PanelSection compound + footer slots",
    body: "Ported V-wave updates from superspace. New PanelSection.Header/Items/Footer trio. leftFooter/centerFooter/rightFooter props.",
  },
  {
    id: "3",
    version: "1.6.0",
    date: Date.now() - 86_400_000 * 9,
    kind: "feature",
    title: "Generic CRUD primitives",
    body: "Q-wave shipped shared <CrudListView> + <CrudFormView> + ColumnDef/FieldDef typed controllers.",
    groups: [
      { heading: "Admin templates upgraded", bullets: ["saas-marketing 6 entities", "agency-studio Clients + Leads", "personal-brand Leads + Newsletter + Comments + Chatbot"] },
      { heading: "Audit guards", bullets: ["Hard-error gate on missing Pages CRUD", "audit-file-size 200-LOC enforcement"] },
    ],
  },
  {
    id: "4",
    version: "1.5.2",
    date: Date.now() - 86_400_000 * 16,
    kind: "fix",
    title: "Convex bare .collect() — bounded with .take(16000)",
    body: "Four migration scripts patched. Audit chain now blocks unbounded reads in CI.",
  },
  {
    id: "5",
    version: "1.5.0",
    date: Date.now() - 86_400_000 * 28,
    kind: "breaking",
    title: "Removed BSDL — manual cp -r is faster",
    body: "Deleted .kitab.json per slice. Solo-dev overhead wasn't justified by sync frequency.",
  },
];

const LAYOUTS = ["timeline", "cards", "list"] as const;

export default function Page() {
  const [layout, setLayout] = React.useState<(typeof LAYOUTS)[number]>("timeline");
  return (
    <SlicePreviewLayout title="Changelog Feed" kind="ui" maxWidth="none">
      <PreviewSection title="Live demo" hint={`layout="${layout}"`}>
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

        <ChangelogFeedSection
          eyebrow="Release notes"
          title="Changelog"
          subtitle="Every release, every fix, every breaking change. Newest first."
          entries={ENTRIES}
          layout={layout}
        />
      </PreviewSection>
    </SlicePreviewLayout>
  );
}
