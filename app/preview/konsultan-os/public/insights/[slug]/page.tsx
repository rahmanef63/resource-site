import { InsightsDetailPage } from "@/components/templates/konsultan/slices/insights/InsightsDetailPage";

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <InsightsDetailPage slug={slug} />;
}
