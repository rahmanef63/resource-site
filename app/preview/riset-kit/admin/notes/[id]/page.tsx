import { NoteEditorView } from "@/components/templates/research/slices/admin/notes/NoteEditorView";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <NoteEditorView id={id} />;
}
