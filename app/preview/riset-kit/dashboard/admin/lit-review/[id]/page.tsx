import { LitReviewEditorView } from "@/components/templates/research/slices/admin/lit-review/LitReviewEditorView";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <LitReviewEditorView id={id} />;
}
