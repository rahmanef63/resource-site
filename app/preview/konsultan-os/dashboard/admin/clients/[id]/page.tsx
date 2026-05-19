import { ClientEditorView } from "@/components/templates/konsultan/slices/admin/clients/ClientEditorView";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ClientEditorView id={id} />;
}
