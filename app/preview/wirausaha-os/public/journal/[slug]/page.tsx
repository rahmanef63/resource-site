import { JournalDetailPage } from "@/components/templates/wirausaha/slices/journal/JournalDetailPage";

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <JournalDetailPage slug={slug} />;
}
