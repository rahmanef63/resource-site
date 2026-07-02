"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/frontend/shared/foundation/utils/convex/any-api";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useLanguage } from "../contexts/LanguageContext";
import { ImageWithLightbox } from "../shared/components/Lightbox";
import { ShareButtons } from "../shared/components/ShareButtons";
import type { PortfolioItem } from "../types/cms-types";

import { Briefcase } from "lucide-react";
import { SearchFilterSort } from "../shared/components/SearchFilterSort";
import ContentRecommendations from "../shared/components/ContentRecommendations";

export default function PortfolioPage() {
  const { t, locale } = useLanguage();

  const portfolioData = useQuery(
    api.features.cmsLite.portfolio.api.queries.listPortfolio,
    { locale },
  );

  // Flatten `{ item, images }` pairs into the `PortfolioItem` shape the UI expects.
  const allItems: PortfolioItem[] = useMemo(() => {
    const raw = (portfolioData?.items ?? []) as Array<{
      item: {
        id: string;
        slug: string;
        locale: string;
        title: string;
        description: string | null;
        tags: string[];
        status: string;
        category?: string | null;
      };
      images: Array<{ id: string; imageUrl: string; altText: string | null; displayOrder: number }>;
    }>;
    return raw.map((entry) => ({
      ...entry.item,
      images: entry.images,
    })) as PortfolioItem[];
  }, [portfolioData]);

  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  const items = useMemo(() => {
    let filtered = [...allItems];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.title.toLowerCase().includes(query) ||
          item.description?.toLowerCase().includes(query) ||
          (item.tags ?? []).some((tag: string) => tag.toLowerCase().includes(query))
      );
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return String(b.id).localeCompare(String(a.id));
        case "oldest":
          return String(a.id).localeCompare(String(b.id));
        case "title":
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

    return filtered;
  }, [allItems, searchQuery, sortBy]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold mb-8">{t("portfolio")}</h1>

        <SearchFilterSort
          searchPlaceholder={
            locale === "id"
              ? "Cari portfolio..."
              : locale === "ar"
              ? "البحث عن المعرض..."
              : "Search portfolio..."
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

        {items.length === 0 ? (
          <p className="text-foreground/60 text-center py-12">No portfolio items available yet.</p>
        ) : (
          <>
            <div className="space-y-16">
              {items.map((item) => (
              <div key={String(item.id)} className="border rounded-lg p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">{item.title}</h2>
                    {item.description && (
                      <p className="text-foreground/70">{item.description}</p>
                    )}
                  </div>
                  <ShareButtons
                    url={`/portfolio#${item.id}`}
                    title={item.title}
                    description={item.description ?? undefined}
                    variant="compact"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {(item.images ?? []).map((img, idx) => (
                    <div key={`${img.imageUrl}-${idx}`} className="aspect-square bg-muted rounded-lg overflow-hidden">
                      <ImageWithLightbox
                        src={img.imageUrl}
                        alt={img.altText || item.title}
                        className="w-full h-full object-cover hover:scale-105 transition-transform"
                        images={(item.images ?? []).map((i) => i.imageUrl)}
                        captions={(item.images ?? []).map((i) => i.altText || item.title)}
                      />
                    </div>
                  ))}
                </div>

                {(item.tags ?? []).length > 0 && (
                  <div className="flex gap-2 mt-6 flex-wrap">
                    {(item.tags ?? []).map((tag: string, idx: number) => (
                      <span key={idx} className="px-3 py-1 bg-muted rounded-full text-sm">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                <ContentRecommendations
                  contentId={String(item.id)}
                  contentType="portfolio"
                  locale={locale}
                />
              </div>
            ))}
            </div>

            <div className="mt-12 text-center">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-8 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-lg"
              >
                <Briefcase className="w-5 h-5" />
                {t("hireMe")}
              </Link>
            </div>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
