import { SupplierEditorView } from "@/components/templates/wirausaha/slices/admin/suppliers/SupplierEditorView";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <SupplierEditorView id={id} />;
}
