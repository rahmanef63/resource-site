import { NewsletterComposeView } from "@/components/templates/agency-studio/slices/admin/newsletter/NewsletterComposeView";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <NewsletterComposeView id={id} />;
}
