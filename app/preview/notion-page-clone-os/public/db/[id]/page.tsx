import { Dashboard } from "@/components/templates/notion-page-clone/slices/notion-app/Dashboard";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <Dashboard activeKind="db" activeId={id} />;
}
