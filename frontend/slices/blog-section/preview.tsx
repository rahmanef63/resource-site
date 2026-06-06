"use client";
/** Variant preview (VP wave) — rr-internal, stripped on `rr add`. */
import type { SlicePreviewModule } from "@/shared/preview/types";
import { BlogListSection, type BlogPost } from "./views/BlogListSection";

const POSTS: BlogPost[] = [
  {
    id: "1",
    slug: "ship-faster",
    title: "Ship faster with vertical slices",
    excerpt: "Own your features end-to-end without framework lock-in.",
    author: "Rahman",
    publishedAt: Date.parse("2026-05-01"),
    tags: ["arch", "dx"],
  },
  {
    id: "2",
    slug: "theme-tokens",
    title: "Theme tokens that travel",
    excerpt: "OKLch presets layered over a site default.",
    author: "Rahman",
    publishedAt: Date.parse("2026-04-18"),
    tags: ["theme"],
  },
  {
    id: "3",
    slug: "copy-first",
    title: "Copy-first beats greenfield",
    excerpt: "Why cloning real code wins over scaffolds.",
    author: "Rahman",
    publishedAt: Date.parse("2026-03-30"),
    tags: ["workflow"],
  },
];

const preview: SlicePreviewModule = {
  BlogListSection: ({ variant }) => (
    <div className="p-4">
      <BlogListSection
        title="Latest posts"
        posts={POSTS}
        hrefFor={(p) => `#${p.slug}`}
        layout={(variant.layout as "cards" | "list" | "featured-split") ?? "cards"}
        columns={(Number(variant.columns) as 1 | 2 | 3) || 2}
        align={(variant.align as "left" | "center") ?? "left"}
        className="px-0 py-0"
      />
    </div>
  ),
};
export default preview;
