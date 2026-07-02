"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useQuery } from "convex/react";
import { api } from "@/frontend/shared/foundation/utils/convex/any-api";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useLanguage } from "../contexts/LanguageContext";
import { useCart } from "../contexts/CartContext";
import { useCurrency } from "../contexts/CurrencyContext";
import { Plus } from "lucide-react";
import { SearchFilterSort } from "../shared/components/SearchFilterSort";

interface Product {
  id: string;
  slug: string;
  titleId: string;
  titleEn: string;
  titleAr: string;
  descId?: string | null;
  descEn?: string | null;
  descAr?: string | null;
  price: number;
  currency: string;
  coverImage?: string | null;
  status: string;
}

export default function ProductsPage() {
  const { t, locale } = useLanguage();
  const { addToCart } = useCart();
  const { convertPrice, formatCurrency } = useCurrency();

  const productsData = useQuery(api.features.cmsLite.products.api.queries.listProducts);
  const allProducts: Product[] = useMemo(
    () => (productsData?.products ?? []) as Product[],
    [productsData],
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  const products = useMemo(() => {
    let filtered = [...allProducts];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((product) => {
        const title = locale === "id" ? product.titleId : locale === "en" ? product.titleEn : product.titleAr;
        const desc = locale === "id" ? product.descId : locale === "en" ? product.descEn : product.descAr;
        return title.toLowerCase().includes(query) || (desc && desc.toLowerCase().includes(query));
      });
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return String(b.id).localeCompare(String(a.id));
        case "oldest":
          return String(a.id).localeCompare(String(b.id));
        case "price-low":
          return a.price - b.price;
        case "price-high":
          return b.price - a.price;
        case "title":
          const titleA = locale === "id" ? a.titleId : locale === "en" ? a.titleEn : a.titleAr;
          const titleB = locale === "id" ? b.titleId : locale === "en" ? b.titleEn : b.titleAr;
          return titleA.localeCompare(titleB);
        default:
          return 0;
      }
    });

    return filtered;
  }, [allProducts, searchQuery, sortBy, locale]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold mb-8">{t("products")}</h1>

        <SearchFilterSort
          searchPlaceholder={
            locale === "id"
              ? "Cari produk..."
              : locale === "ar"
              ? "البحث عن المنتجات..."
              : "Search products..."
          }
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
          sortOptions={[
            { value: "newest", label: locale === "id" ? "Terbaru" : locale === "ar" ? "الأحدث" : "Newest" },
            { value: "oldest", label: locale === "id" ? "Terlama" : locale === "ar" ? "الأقدم" : "Oldest" },
            { value: "price-low", label: locale === "id" ? "Harga Terendah" : locale === "ar" ? "السعر الأدنى" : "Price: Low to High" },
            { value: "price-high", label: locale === "id" ? "Harga Tertinggi" : locale === "ar" ? "السعر الأعلى" : "Price: High to Low" },
            { value: "title", label: locale === "id" ? "Judul" : locale === "ar" ? "العنوان" : "Title" },
          ]}
          sortValue={sortBy}
          onSortChange={setSortBy}
        />

        {products.length === 0 ? (
          <p className="text-foreground/60 text-center py-12">No products available yet.</p>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {products.map((product) => (
              <Link
                key={String(product.id)}
                href={`/products/${product.slug}`}
                className="group border rounded-lg overflow-hidden hover:shadow-lg transition-shadow bg-background"
              >
                {product.coverImage && (
                  <div className="relative aspect-video bg-muted overflow-hidden">
                    <Image
                      src={product.coverImage}
                      alt={locale === "id" ? product.titleId : locale === "en" ? product.titleEn : product.titleAr}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  </div>
                )}
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2">
                    {locale === "id" ? product.titleId : locale === "en" ? product.titleEn : product.titleAr}
                  </h3>
                  <p className="text-foreground/70 mb-4 line-clamp-2">
                    {locale === "id" ? product.descId : locale === "en" ? product.descEn : product.descAr}
                  </p>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-lg font-bold">
                      {formatCurrency(convertPrice(product.price, product.currency))}
                    </span>
                    <span className="text-primary group-hover:underline">
                      {t("readMore")} →
                    </span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      addToCart(String(product.id));
                    }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    {t("addToCart")}
                  </button>
                </div>
              </Link>
            ))}
            </div>

            <div className="mt-12 text-center">
              <Link
                href="/contact"
                className="inline-flex items-center px-8 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-lg"
              >
                {t("contactUs")}
              </Link>
            </div>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
