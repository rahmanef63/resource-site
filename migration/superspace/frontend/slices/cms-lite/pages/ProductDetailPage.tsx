"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useQuery } from "convex/react";
import { api } from "@/frontend/shared/foundation/utils/convex/any-api";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useLanguage } from "../contexts/LanguageContext";
import { useCart } from "../contexts/CartContext";
import { useCurrency } from "../contexts/CurrencyContext";
import type { Product } from "../types/cms-types";

import { ArrowLeft, ShoppingCart, Plus } from "lucide-react";
import { ShareButtons } from "../shared/components/ShareButtons";

interface ProductDetailPageProps {
  slug?: string; // Can be passed as prop from dynamic route
}

export default function ProductDetailPage({ slug: slugProp }: ProductDetailPageProps = {}) {
  const pathname = usePathname();
  const { locale } = useLanguage();
  const { addToCart } = useCart();
  const { convertPrice, formatCurrency } = useCurrency();

  // Extract slug from pathname if not provided as prop
  const slug = slugProp || pathname?.split("/").pop();

  const productData = useQuery(
    api.features.cmsLite.products.api.queries.getProductBySlug,
    slug ? { slug } : "skip",
  );
  const loading = productData === undefined && !!slug;
  const product: Product | null = (productData?.product ?? null) as Product | null;

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

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-xl mb-4">Product not found</p>
            <Link href="/products" className="text-primary hover:underline">
              ← Back to products
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const title = locale === "id" ? product.titleId : locale === "en" ? product.titleEn : product.titleAr;
  const desc = locale === "id" ? product.descId : locale === "en" ? product.descEn : product.descAr;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link href="/products" className="inline-flex items-center gap-2 text-foreground/70 hover:text-foreground mb-8">
          <ArrowLeft className="w-4 h-4" />
          Back to products
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div>
            {product.coverImage ? (
              <Image
                src={product.coverImage}
                alt={title ?? "Product"}
                width={1200}
                height={900}
                className="w-full h-auto rounded-lg shadow-lg"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            ) : (
              <div className="w-full aspect-square bg-muted rounded-lg flex items-center justify-center">
                <p className="text-foreground/40">No image</p>
              </div>
            )}
          </div>

          <div>
            <h1 className="text-4xl font-bold mb-4">{title}</h1>
            <p className="text-3xl font-bold text-primary mb-6">
              {formatCurrency(convertPrice(product.price, product.currency ?? "USD"))}
            </p>
            <p className="text-foreground/80 mb-8 whitespace-pre-wrap">
              {desc}
            </p>

            <div className="flex flex-wrap gap-4 mb-6">
              <button
                onClick={async () => {
                  try {
                    await addToCart(String(product.id));
                  } catch (error) {
                    console.error("Add to cart error:", error);
                  }
                }}
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Add to Cart
              </button>

              {product.paymentLink && (
                <a
                  href={product.paymentLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 border border-primary text-primary rounded-lg hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  <ShoppingCart className="w-5 h-5" />
                  Buy Now
                </a>
              )}
            </div>

            <ShareButtons
              url={`/products/${product.slug}`}
              title={title ?? "Product"}
              description={desc ?? undefined}
              variant="compact"
            />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
