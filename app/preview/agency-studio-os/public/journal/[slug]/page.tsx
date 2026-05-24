import type { Metadata } from "next";
import { JournalDetailPage } from "@/components/templates/agency-studio/slices/journal/JournalDetailPage";
import { SEED_ARTICLES } from "@/components/templates/agency-studio/shared/journal-seed";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const a = SEED_ARTICLES.find((x) => x.slug === slug);
  if (!a) return { title: "Article not found" };
  return {
    title: a.title,
    description: a.excerpt,
    openGraph: {
      title: a.title,
      description: a.excerpt,
      type: "article",
      images: a.cover ? [{ url: a.cover }] : [],
    },
    twitter: { card: "summary_large_image", title: a.title, description: a.excerpt },
  };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <JournalDetailPage slug={slug} />;
}
