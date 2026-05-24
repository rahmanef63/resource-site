import { InsightsDetailPage } from "@/components/templates/research/slices/insights/InsightsDetailPage";

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <InsightsDetailPage slug={slug} />;
}
