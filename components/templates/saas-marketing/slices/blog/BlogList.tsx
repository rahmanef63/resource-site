"use client";

import { BlogListSection, type BlogPost as SliceBlogPost } from "@/features/blog-section";
import { usePosts } from "../../shared/store";
import { PUBLIC_BASE } from "../../shared/nav-config";

/**
 * Hybrid wrapper: reads live posts via usePosts() and feeds the canonical
 * BlogListSection slice (DRY+SSOT). Admin edits propagate via the
 * createTemplateStore BroadcastChannel.
 */
export function BlogList() {
  const posts = usePosts();
  const items: SliceBlogPost[] = posts.map((p) => ({
    id: p.id,
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt,
    author: p.author,
    publishedAt: p.publishedAt,
    tags: p.tags,
  }));
  return (
    <BlogListSection
      eyebrow="Blog"
      title="From the team"
      subtitle="Engineering deep-dives, customer stories, and product thinking."
      posts={items}
      hrefFor={(p) => `${PUBLIC_BASE}/blog/${p.slug}`}
      layout="list"
      className="!px-0"
    />
  );
}
