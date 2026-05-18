import { PricingEditorView } from "@/components/templates/saas-marketing/slices/admin/pricing/PricingEditorView";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <PricingEditorView id={id} />;
}
