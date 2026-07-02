"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useQuery } from "convex/react";
import { api } from "@/frontend/shared/foundation/utils/convex/any-api";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useLanguage } from "../contexts/LanguageContext";
import type { Post } from "../types/cms-types";

import { BookOpen } from "lucide-react";
import { SearchFilterSort } from "../shared/components/SearchFilterSort";

export default function BlogPage() {
  const { t, locale } = useLanguage();
  const postsData = useQuery(api.features.cmsLite.posts.api.queries.listPosts, { locale });
  const allPosts: Post[] = useMemo(() => (postsData?.posts ?? []) as Post[], [postsData]);

  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  const posts = useMemo(() => {
    let filtered = [...allPosts];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (post) =>
          post.title.toLowerCase().includes(query) ||
          post.excerpt?.toLowerCase().includes(query)
      );
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.publishedAt || 0).getTime() - new Date(a.publishedAt || 0).getTime();
        case "oldest":
          return new Date(a.publishedAt || 0).getTime() - new Date(b.publishedAt || 0).getTime();
        case "title":
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

    return filtered;
  }, [allPosts, searchQuery, sortBy]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold mb-8">{t("blog")}</h1>

        <SearchFilterSort
          searchPlaceholder={
            locale === "id"
              ? "Cari artikel..."
              : locale === "ar"
              ? "البحث عن المقالات..."
              : "Search articles..."
          }
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
          sortOptions={[
            { value: "newest", label: locale === "id" ? "Terbaru" : locale === "ar" ? "الأحدث" : "Newest" },
            { value: "oldest", label: locale === "id" ? "Terlama" : locale === "ar" ? "الأقدم" : "Oldest" },
            { value: "title", label: locale === "id" ? "Judul" : locale === "ar" ? "العنوان" : "Title" },
          ]}
          sortValue={sortBy}
          onSortChange={setSortBy}
        />

        {posts.length === 0 ? (
          <p className="text-foreground/60 text-center py-12">No blog posts available yet.</p>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="group border rounded-lg overflow-hidden hover:shadow-lg transition-shadow bg-background"
              >
                {post.coverImage && (
                  <div className="relative aspect-video bg-muted overflow-hidden">
                    <Image
                      src={post.coverImage}
                      alt={post.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  </div>
                )}
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2">{post.title}</h3>
                  {post.excerpt && (
                    <p className="text-foreground/70 mb-4 line-clamp-3">{post.excerpt}</p>
                  )}
                  <span className="text-primary group-hover:underline">
                    {t("readMore")} →
                  </span>
                </div>
              </Link>
            ))}
            </div>

            <div className="mt-12 text-center">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-8 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-lg"
              >
                <BookOpen className="w-5 h-5" />
                {t("subscribe")}
              </Link>
            </div>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
