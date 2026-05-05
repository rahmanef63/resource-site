import type { Metadata } from "next";
import { PortfolioDetailPage } from "@/components/templates/agency-studio/slices/portfolio/PortfolioDetailPage";
import { SEED_PROJECTS } from "@/components/templates/agency-studio/shared/seed";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const p = SEED_PROJECTS.find((x) => x.slug === slug);
  if (!p) return { title: "Project not found" };
  return {
    title: p.title,
    description: p.blurb,
    openGraph: {
      title: p.title,
      description: p.blurb,
      type: "article",
      images: p.cover ? [{ url: p.cover }] : [],
    },
    twitter: { card: "summary_large_image", title: p.title, description: p.blurb },
  };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <PortfolioDetailPage slug={slug} />;
}
