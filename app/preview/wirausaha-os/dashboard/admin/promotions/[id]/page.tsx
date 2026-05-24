import { PromotionEditorView } from "@/components/templates/wirausaha/slices/admin/promotions/PromotionEditorView";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <PromotionEditorView id={id} />;
}
