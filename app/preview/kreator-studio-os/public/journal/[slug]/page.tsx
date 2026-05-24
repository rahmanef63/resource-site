import { JournalDetailPage } from "@/components/templates/kreator-studio/slices/journal/JournalDetailPage";

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <JournalDetailPage slug={slug} />;
}
