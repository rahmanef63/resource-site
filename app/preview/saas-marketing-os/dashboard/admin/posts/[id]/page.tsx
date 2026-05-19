import { PostEditorView } from "@/components/templates/saas-marketing/slices/admin/posts/PostEditorView";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <PostEditorView id={id} />;
}
