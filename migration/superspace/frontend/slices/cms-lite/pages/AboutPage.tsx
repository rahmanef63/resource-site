"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useQuery } from "convex/react";
import { api } from "@/frontend/shared/foundation/utils/convex/any-api";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useLanguage } from "../contexts/LanguageContext";
import { Skeleton } from "../shared/components/Skeleton";

type LandingContent = { title?: string; description?: string; image?: string };

export default function AboutPage() {
  const { locale } = useLanguage();

  const [host, setHost] = useState<string | null>(null);
  useEffect(() => {
    if (typeof window !== "undefined") {
      setHost(window.location.host);
    }
  }, []);

  const landing = useQuery(
    api.features.cmsLite.landing.api.queries.getPublicContent,
    host ? { host, section: "about", locale, fallbackLocale: "en" } : "skip",
  );

  const contentNode = (landing?.content ?? null) as
    | { title?: string; description?: string; media?: Array<{ url: string }> }
    | null;

  const content: LandingContent | null = contentNode
    ? {
        title: contentNode.title,
        description: contentNode.description,
        image: contentNode.media?.[0]?.url,
      }
    : null;

  // Loading while host is not resolved OR the Convex query is pending.
  const loading = host === null || landing === undefined;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1">
        <section className="py-20">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            {loading ? (
              <div className="space-y-8">
                <Skeleton className="h-12 w-64" />
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-32 w-full" />
              </div>
            ) : !content ? (
              <div className="text-center text-foreground/60">
                <h1 className="text-4xl font-bold mb-4">About</h1>
                <p>About content will appear here once the public landing query is available.</p>
                <p className="text-xs mt-4 opacity-60">locale: {locale}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                {content?.image && (
                  <div className="rounded-lg overflow-hidden">
                    <Image
                      src={content.image}
                      alt={content.title ?? "About"}
                      width={800}
                      height={600}
                      className="w-full h-auto object-cover"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  </div>
                )}
                <div className={!content?.image ? "md:col-span-2" : ""}>
                  <h1 className="text-4xl font-bold mb-6">{content?.title}</h1>
                  <p className="text-lg text-foreground/80 whitespace-pre-wrap">
                    {content?.description}
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
