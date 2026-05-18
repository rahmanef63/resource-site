"use client";

import * as React from "react";
import { TestimonialsGridSection, type Testimonial } from "@/features/testimonials-grid";
import { SlicePreviewLayout, PreviewSection } from "@/components/slice-previews/preview-layout";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const ITEMS: Testimonial[] = [
  { id: "1", quote: "We replaced 3 services with rr slices in a weekend. Our infra bill dropped 60%.", author: "Maya Chen", role: "CTO", company: "Linear-Forge", rating: 5, featured: true },
  { id: "2", quote: "The copy-first model is genius. No version conflicts, no surprise deps. Just code I own.", author: "Daniel Park", role: "Staff Engineer", company: "Indigo Labs", rating: 5 },
  { id: "3", quote: "Shipped a marketing site + admin dashboard in one afternoon. The slices just compose.", author: "Sara Ortiz", role: "Founder", company: "Quill", rating: 5 },
  { id: "4", quote: "Convex + rr is the React stack I wish existed five years ago.", author: "Ben Kowalski", role: "Solo Dev", rating: 5 },
  { id: "5", quote: "Our designers can edit Tailwind classes directly. Zero theming-system fighting.", author: "Priya Iyer", role: "Design Lead", company: "Northwave", rating: 4 },
  { id: "6", quote: "Best DX I've had in years. The MCP server alone is worth installing.", author: "Tomás Silva", role: "Tech Lead", company: "Refit", rating: 5 },
];

const LAYOUTS = ["cards", "quote-stack", "masonry"] as const;

export default function Page() {
  const [layout, setLayout] = React.useState<(typeof LAYOUTS)[number]>("cards");
  return (
    <SlicePreviewLayout title="Testimonials Grid" kind="ui" maxWidth="none">
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

        <TestimonialsGridSection
          eyebrow="Testimonials"
          title="Trusted by builders shipping in production"
          subtitle="Real teams using rr slices in revenue-bearing apps."
          items={ITEMS}
          layout={layout}
          columns={3}
        />
      </PreviewSection>
    </SlicePreviewLayout>
  );
}
