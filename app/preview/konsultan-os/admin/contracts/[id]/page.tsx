import { ContractEditorView } from "@/components/templates/konsultan/slices/admin/contracts/ContractEditorView";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ContractEditorView id={id} />;
}
