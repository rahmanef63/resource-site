import { SubscriptionEditorView } from "@/components/templates/saas-marketing/slices/admin/subscriptions/SubscriptionEditorView";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <SubscriptionEditorView id={id} />;
}
