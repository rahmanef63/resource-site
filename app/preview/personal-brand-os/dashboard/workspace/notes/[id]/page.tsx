import { NoteEditor } from "@/components/templates/personal-brand/slices/workspace/notes/NoteEditor";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <NoteEditor id={id} />;
}
