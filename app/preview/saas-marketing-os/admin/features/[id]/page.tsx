import { FeatureEditorView } from "@/components/templates/saas-marketing/slices/admin/features/FeatureEditorView";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <FeatureEditorView id={id} />;
}
