import { JournalEditorView } from "@/components/templates/agency-studio/slices/admin/journal-editor/JournalEditorView";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <JournalEditorView id={id === "new" ? null : id} />;
}
