import { CommentEditorView } from "@/components/templates/kreator-studio/slices/admin/comments/CommentEditorView";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <CommentEditorView id={id} />;
}
