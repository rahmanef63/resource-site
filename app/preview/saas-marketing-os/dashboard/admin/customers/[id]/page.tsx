import { CustomerEditorView } from "@/components/templates/saas-marketing/slices/admin/customers/CustomerEditorView";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <CustomerEditorView id={id} />;
}
