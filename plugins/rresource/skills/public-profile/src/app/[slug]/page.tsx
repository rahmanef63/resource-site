// Vendored in plugins/rresource. Self-contained — no cross-slice imports.
// Default state = localStorage. Optional Convex schema + fns under ./convex/.

import { fetchQuery } from "convex/nextjs";
import { notFound } from "next/navigation";
import { api } from "../../../../convex/_generated/api";
import { PublicProfileView } from "../../components/PublicProfileView";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }) {
  const { slug } = await params;
  const p = await fetchQuery(api.profile.getPublicBySlug, { slug });
  if (!p) return { title: "Not found" };
  return {
    title: p.displayName,
    description: p.bio,
    openGraph: { title: p.displayName, description: p.bio, images: p.avatarUrl ? [p.avatarUrl] : [] },
  };
}

export default async function PublicProfilePage({ params }: { params: Params }) {
  const { slug } = await params;
  const profile = await fetchQuery(api.profile.getPublicBySlug, { slug });
  if (!profile) notFound();
  return <PublicProfileView profile={profile} />;
}
