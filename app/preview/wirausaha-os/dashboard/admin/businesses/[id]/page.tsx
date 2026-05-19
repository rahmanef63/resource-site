import { BusinessEditorView } from "@/components/templates/wirausaha/slices/admin/businesses/BusinessEditorView";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <BusinessEditorView id={id} />;
}
