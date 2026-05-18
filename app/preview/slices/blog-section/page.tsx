"use client";

import * as React from "react";
import { BlogListSection, BlogPostView, type BlogPost } from "@/features/blog-section";
import { SlicePreviewLayout, PreviewSection } from "@/components/slice-previews/preview-layout";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const POSTS: BlogPost[] = [
  {
    id: "1",
    slug: "shipping-rr-1-7",
    title: "Shipping rr 1.7 — seven new canonical UI slices",
    excerpt: "Pricing, features, FAQ, testimonials, blog, changelog, portfolio. One copy-first slice each, four templates migrated.",
    body: "We just shipped rr 1.7 — seven new canonical UI slices that any template can consume.\n\nThe big idea: every marketing template (saas-marketing, agency-studio, personal-brand, wirausaha) used to duplicate pricing/FAQ/blog inline. That's 4× the code to maintain, 4× the bugs to fix, 4× the time to design-system tweak.\n\nWith rr 1.7, every template now imports `PricingSection` from a single slice. Admin edits propagate without per-template rewrites.\n\nThe slot pattern (renderTierCta, sections, afterContent) lets templates customize the canonical without forking.",
    author: "Rahman",
    publishedAt: Date.now() - 86_400_000 * 2,
    tags: ["release", "slices"],
    cover: { src: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=1200&auto=format&fit=crop", alt: "Code on a screen" },
  },
  {
    id: "2",
    slug: "three-column-v-wave",
    title: "ThreeColumn layout V-wave port — trigger ≠ header",
    excerpt: "PanelSection compound + footer slots + clear separation of collapse-trigger from chrome.",
    author: "Rahman",
    publishedAt: Date.now() - 86_400_000 * 5,
    tags: ["layout", "shadcn"],
    cover: { src: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=1200&auto=format&fit=crop", alt: "Workspace layout" },
  },
  {
    id: "3",
    slug: "publishing-cli-1-7",
    title: "Publishing rr-cli 1.7.0 to npm",
    excerpt: "45 slices, 14 templates, MCP server + dynamic resources. All live on npm.",
    author: "Rahman",
    publishedAt: Date.now() - 86_400_000 * 7,
    tags: ["release"],
    cover: { src: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=1200&auto=format&fit=crop", alt: "Terminal output" },
  },
  {
    id: "4",
    slug: "copy-first-architecture",
    title: "Why copy-first beats npm dependency",
    excerpt: "shadcn was right. Slices belong in your repo, not your node_modules.",
    author: "Rahman",
    publishedAt: Date.now() - 86_400_000 * 12,
    tags: ["architecture"],
    cover: { src: "https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?w=1200&auto=format&fit=crop", alt: "Open book" },
  },
];

const LAYOUTS = ["cards", "list", "featured-split", "detail"] as const;

export default function Page() {
  const [layout, setLayout] = React.useState<(typeof LAYOUTS)[number]>("cards");
  return (
    <SlicePreviewLayout title="Blog Section" kind="ui" maxWidth="none">
      <PreviewSection title="Live demo" hint={layout === "detail" ? "BlogPostView" : `BlogListSection layout="${layout}"`}>
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
          <BlogPostView
            post={POSTS[0]!}
            backHref="#"
            related={POSTS.slice(1, 4)}
            hrefForRelated={(p) => `#${p.slug}`}
          />
        ) : (
          <BlogListSection
            eyebrow="Updates"
            title="What's new"
            subtitle="Release notes, architecture posts, and behind-the-scenes from building rr."
            posts={POSTS}
            hrefFor={(p) => `#${p.slug}`}
            layout={layout}
            columns={3}
          />
        )}
      </PreviewSection>
    </SlicePreviewLayout>
  );
}
