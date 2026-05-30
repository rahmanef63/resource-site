import { redirect } from "next/navigation";

// Per-recipe URLs map 1:1 onto the slice they were folded into.
// Preserve inbound links/bookmarks: /recipes/<slug> → /slices/<slug>.
export default async function RecipeSlugRedirect({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  redirect(`/slices/${slug}`);
}
