import { InvoiceEditorView } from "@/components/templates/konsultan/slices/admin/billing/InvoiceEditorView";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <InvoiceEditorView id={id} />;
}
