"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useQuery } from "convex/react";
import { api } from "@/frontend/shared/foundation/utils/convex/any-api";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useLanguage } from "../contexts/LanguageContext";
import type { Post } from "../types/cms-types";

import { ArrowLeft } from "lucide-react";
import { ShareButtons } from "../shared/components/ShareButtons";
import { Comments } from "../shared/components/Comments";
import ContentRecommendations from "../shared/components/ContentRecommendations";

interface BlogPostPageProps {
  slug?: string; // Can be passed as prop from dynamic route
}

export default function BlogPostPage({ slug: slugProp }: BlogPostPageProps = {}) {
  const pathname = usePathname();
  const { locale } = useLanguage();

  // Extract slug from pathname if not provided as prop
  const slug = slugProp || pathname?.split("/").pop();

  // Only fire query when slug is known. Passing `"skip"` is Convex's idiomatic
  // way to conditionally skip a query while preserving hook order.
  const postData = useQuery(
    api.features.cmsLite.posts.api.queries.getPostBySlug,
    slug ? { slug, locale } : "skip",
  );
  const loading = postData === undefined && !!slug;
  const post: Post | null = (postData?.post ?? null) as Post | null;

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <p>Loading...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-xl mb-4">Post not found</p>
            <Link href="/blog" className="text-primary hover:underline">
              ← Back to blog
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link href="/blog" className="inline-flex items-center gap-2 text-foreground/70 hover:text-foreground mb-8">
          <ArrowLeft className="w-4 h-4" />
          Back to blog
        </Link>

        <article>
          {post.coverImage && (
            <Image
              src={post.coverImage}
              alt={post.title}
              width={1200}
              height={800}
              className="w-full h-auto rounded-lg shadow-lg mb-8"
              sizes="(max-width: 768px) 100vw, 768px"
            />
          )}

          <h1 className="text-4xl font-bold mb-4">{post.title}</h1>

          {post.publishedAt && (
            <p className="text-foreground/60 mb-6">
              {new Date(post.publishedAt).toLocaleDateString(locale)}
            </p>
          )}

          <ShareButtons
            url={`/blog/${post.slug}`}
            title={post.title}
            description={post.excerpt ?? undefined}
            className="mb-8"
          />

          <div className="prose prose-lg max-w-none mb-12">
            <p className="whitespace-pre-wrap">{post.body}</p>
          </div>

          <Comments postId={Number(post.id)} />

          <ContentRecommendations
            contentId={String(post.id)}
            contentType="post"
            locale={locale}
          />
        </article>
      </main>

      <Footer />
    </div>
  );
}
