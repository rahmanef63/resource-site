import { ConsultDocEditorView } from "@/components/templates/konsultan/slices/admin/documents/ConsultDocEditorView";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ConsultDocEditorView id={id} />;
}
