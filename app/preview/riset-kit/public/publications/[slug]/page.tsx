import { PublicationsDetailPage } from "@/components/templates/research/slices/publications/PublicationsDetailPage";

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <PublicationsDetailPage slug={slug} />;
}
