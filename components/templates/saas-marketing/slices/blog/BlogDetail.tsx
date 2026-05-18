"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BlogPostView, type BlogPost as SliceBlogPost } from "@/features/blog-section";
import { usePost } from "../../shared/store";
import { PUBLIC_BASE } from "../../shared/nav-config";

/**
 * Hybrid wrapper: reads live post via usePost(slug) and feeds the canonical
 * BlogPostView slice. Admin edits propagate via createTemplateStore.
 */
export function BlogDetail({ slug }: { slug: string }) {
  const post = usePost(slug);
  if (!post) {
    return (
      <section>
        <div className="mx-auto max-w-2xl px-6 py-24 text-center">
          <p className="text-sm text-muted-foreground">Post not found.</p>
          <Button asChild variant="ghost" className="mt-4">
            <Link href={`${PUBLIC_BASE}/blog`}><ArrowLeft className="size-4" /> Back to blog</Link>
          </Button>
        </div>
      </section>
    );
  }
  const slicePost: SliceBlogPost = {
    id: post.id,
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    body: post.body,
    author: post.author,
    publishedAt: post.publishedAt,
    tags: post.tags,
  };
  return (
    <BlogPostView
      post={slicePost}
      backHref={`${PUBLIC_BASE}/blog`}
      className="!px-6"
    />
  );
}
