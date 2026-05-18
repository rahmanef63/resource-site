import { ProjectEditorView } from "@/components/templates/konsultan/slices/admin/projects/ProjectEditorView";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ProjectEditorView id={id} />;
}
