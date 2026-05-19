import { AiReaderEditorView } from "@/components/templates/research/slices/admin/ai-reader/AiReaderEditorView";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AiReaderEditorView id={id} />;
}
