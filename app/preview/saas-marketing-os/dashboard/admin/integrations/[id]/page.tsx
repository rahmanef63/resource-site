import { IntegrationEditorView } from "@/components/templates/saas-marketing/slices/admin/integrations/IntegrationEditorView";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <IntegrationEditorView id={id} />;
}
