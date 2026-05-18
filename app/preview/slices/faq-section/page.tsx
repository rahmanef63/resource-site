"use client";

import * as React from "react";
import { FAQSection, type FAQItem } from "@/features/faq-section";
import { SlicePreviewLayout, PreviewSection } from "@/components/slice-previews/preview-layout";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const ITEMS: FAQItem[] = [
  { id: "1", q: "How do I get started?", a: "Run `npx rr init my-app` and pick a template — you'll have a working dashboard in under a minute.", category: "Getting started" },
  { id: "2", q: "Can I use it without Convex?", a: "Some slices are framework-agnostic UI; others assume Convex. Each slice's README lists hard dependencies.", category: "Getting started" },
  { id: "3", q: "Do I own the code?", a: "Yes — every slice is copied into your repo. No runtime npm dependency, no framework lock-in.", category: "License" },
  { id: "4", q: "What about updates?", a: "Run `npx rr update <slug>` to re-pull upstream. The CLI warns if you've edited the local copy.", category: "License" },
  { id: "5", q: "How is auth handled?", a: "All auth slices use @convex-dev/auth — no Clerk dependency. Wire your own provider in config.", category: "Auth" },
  { id: "6", q: "Can I deploy to Vercel?", a: "Yes. Convex backend runs separately (self-hosted Docker or Convex Cloud), Next.js app deploys anywhere.", category: "Deploy" },
];

const LAYOUTS = ["single", "two-column", "grouped"] as const;

export default function Page() {
  const [layout, setLayout] = React.useState<(typeof LAYOUTS)[number]>("single");
  return (
    <SlicePreviewLayout title="FAQ Section" kind="ui" maxWidth="none">
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

        <FAQSection
          eyebrow="FAQ"
          title="Frequently asked questions"
          subtitle="Answers to the things people ask most often before installing rr."
          items={ITEMS}
          layout={layout}
          defaultOpen={["1"]}
          footerCta={{ label: "Contact support", href: "#", question: "Still have questions?" }}
        />
      </PreviewSection>
    </SlicePreviewLayout>
  );
}
