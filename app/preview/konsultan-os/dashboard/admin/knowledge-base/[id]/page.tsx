import { KbEditorView } from "@/components/templates/konsultan/slices/admin/knowledge-base/KbEditorView";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <KbEditorView id={id} />;
}
