"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useQuery } from "convex/react";
import { api } from "@/frontend/shared/foundation/utils/convex/any-api";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Chatbot from "../components/Chatbot";
import { useLanguage } from "../contexts/LanguageContext";
import { useCart } from "../contexts/CartContext";
import { useCurrency } from "../contexts/CurrencyContext";

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

interface ServiceItem {
  _id: string;
  slug: string;
  labelId: string;
  labelEn: string;
  labelAr: string;
  displayOrder: number;
  active: boolean;
}

import { Camera, Users, Coffee, MessageSquare, Plus, ArrowRight } from "lucide-react";

export default function HomePage() {
  const { t, locale } = useLanguage();
  const { addToCart } = useCart();
  const { convertPrice, formatCurrency } = useCurrency();

  const [host, setHost] = useState<string | null>(null);
  useEffect(() => {
    if (typeof window !== "undefined") {
      setHost(window.location.host);
    }
  }, []);

  const productsData = useQuery(api.features.cmsLite.products.api.queries.listProducts);
  const servicesData = useQuery(api.features.cmsLite.services.api.queries.listServices);

  const heroLanding = useQuery(
    api.features.cmsLite.landing.api.queries.getPublicContent,
    host ? { host, section: "hero", locale, fallbackLocale: "en" } : "skip",
  );
  const aboutLanding = useQuery(
    api.features.cmsLite.landing.api.queries.getPublicContent,
    host ? { host, section: "about", locale, fallbackLocale: "en" } : "skip",
  );

  const products: Product[] = useMemo(
    () => ((productsData?.products ?? []) as Product[]).slice(0, 3),
    [productsData],
  );
  const services: ServiceItem[] = useMemo(
    () => (servicesData?.services ?? []) as ServiceItem[],
    [servicesData],
  );

  type HeroContent = { title?: string; description?: string; image?: string; ctaText?: string; ctaLink?: string };
  type AboutContent = { title?: string; description?: string; image?: string };

  const heroContent: HeroContent | null = useMemo(() => {
    const node = heroLanding?.content as
      | {
          title?: string;
          description?: string;
          media?: Array<{ url: string }>;
          primaryCta?: { text?: string; url?: string };
        }
      | undefined;
    if (!node) return null;
    return {
      title: node.title,
      description: node.description,
      image: node.media?.[0]?.url,
      ctaText: node.primaryCta?.text,
      ctaLink: node.primaryCta?.url,
    };
  }, [heroLanding]);

  const aboutContent: AboutContent | null = useMemo(() => {
    const node = aboutLanding?.content as
      | { title?: string; description?: string; media?: Array<{ url: string }> }
      | undefined;
    if (!node) return null;
    return {
      title: node.title,
      description: node.description,
      image: node.media?.[0]?.url,
    };
  }, [aboutLanding]);

  const getServiceIcon = (slug: string) => {
    switch (slug) {
      case "private-photoshoot": return <Camera className="w-8 h-8" />;
      case "group-travel": return <Users className="w-8 h-8" />;
      case "food-beverages": return <Coffee className="w-8 h-8" />;
      case "based-on-request": return <MessageSquare className="w-8 h-8" />;
      default: return <Camera className="w-8 h-8" />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1">
        <section className="bg-gradient-to-b from-muted/50 to-background py-20 md:py-32 relative overflow-hidden">
          {heroContent?.image && (
            <div className="absolute inset-0 opacity-20">
              <Image
                src={heroContent.image}
                alt=""
                fill
                className="object-cover"
                sizes="100vw"
              />
            </div>
          )}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              {heroContent?.title || "Saudi Visuals"}
            </h1>
            <p className="text-lg md:text-xl text-foreground/80 max-w-2xl mx-auto mb-8">
              {heroContent?.description || t("tagline")}
            </p>
            <div className="flex gap-4 justify-center">
              <Link
                href={heroContent?.ctaLink || "/products"}
                className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                {heroContent?.ctaText || t("products")}
              </Link>
              <Link
                href="/portfolio"
                className="px-6 py-3 border border-border rounded-lg hover:bg-muted transition-colors"
              >
                {t("viewPortfolio")}
              </Link>
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold mb-12 text-center">{t("services")}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {services.map((service) => (
                <div key={service._id} className="p-6 border rounded-lg hover:shadow-lg transition-shadow">
                  <div className="mb-4 text-secondary">
                    {getServiceIcon(service.slug)}
                  </div>
                  <h3 className="font-semibold text-lg">
                    {locale === "id" ? service.labelId : locale === "en" ? service.labelEn : service.labelAr}
                  </h3>
                </div>
              ))}
            </div>
          </div>
        </section>

        {aboutContent && (
          <section className="py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                {aboutContent.image && (
                  <div className="rounded-lg overflow-hidden">
                    <Image
                      src={aboutContent.image}
                      alt={aboutContent.title ?? "About"}
                      width={800}
                      height={600}
                      className="w-full h-auto object-cover"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  </div>
                )}
                <div>
                  <h2 className="text-3xl font-bold mb-6">{aboutContent.title}</h2>
                  <p className="text-lg text-foreground/80 mb-6">{aboutContent.description}</p>
                  <Link
                    href="/about"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    {t("learnMore")}
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </div>
              </div>
            </div>
          </section>
        )}

        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center mb-12">
              <h2 className="text-3xl font-bold">{t("products")}</h2>
              <Link href="/products" className="text-primary hover:underline">
                {t("viewPortfolio")} →
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
          </div>
        </section>
      </main>

      <Footer />
      <Chatbot />
    </div>
  );
}
