import { PerformanceEditorView } from "@/components/templates/kreator-studio/slices/admin/performance/PerformanceEditorView";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <PerformanceEditorView id={id} />;
}
