import { ProposalEditorView } from "@/components/templates/konsultan/slices/admin/proposals/ProposalEditorView";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ProposalEditorView id={id} />;
}
