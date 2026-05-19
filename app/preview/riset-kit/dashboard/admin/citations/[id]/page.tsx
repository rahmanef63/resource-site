import { CitationEditorView } from "@/components/templates/research/slices/admin/citations/CitationEditorView";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <CitationEditorView id={id} />;
}
