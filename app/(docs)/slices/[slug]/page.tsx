import { notFound } from "next/navigation";
import Link from "next/link";
import { Bot, ExternalLink } from "lucide-react";
import { slices, getSlice } from "@/lib/content/slices";
import { Button } from "@/components/ui/button";
import { ShowcaseCard } from "@/components/site/catalog/showcase-card";
import { SlicePreviewSection } from "@/components/site/slice-preview-section";
import { UseWideLayout } from "@/components/site/use-wide-layout";
import {
  RelatedFeatures,
  RELATED_ICONS,
  type RelatedGroup,
} from "@/components/site/related-features";
import { SliceTitle, InstallCard } from "./page-header";
import { MetaCardsGrid, ProvidersCard } from "./page-meta-cards";

export function generateStaticParams() {
  return slices.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const slice = getSlice(slug);
  if (!slice) return { title: "Slice not found" };
  return {
    title: `${slice.title} — Slice`,
    description: slice.description,
  };
}

export default async function SliceDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const slice = getSlice(slug);
  if (!slice) notFound();

  const peerSlices = (slice.peers ?? [])
    .map((p) => ({ peer: p, target: getSlice(p.slug) }))
    .filter((x): x is { peer: typeof x.peer; target: NonNullable<typeof x.target> } => !!x.target);

  const enhancesItems = (slice.compat?.enhances ?? [])
    .map((s) => getSlice(s))
    .filter((s): s is NonNullable<typeof s> => !!s);

  const siblingItems = slices
    .filter((s) => s.slug !== slice.slug && s.category === slice.category)
    .slice(0, 6);

  const relatedGroups: RelatedGroup[] = [
    {
      id: "peers",
      label: "Peer slices",
      hint: "required co-dependencies",
      icon: RELATED_ICONS.peers,
      items: peerSlices.map(({ peer, target }) => ({
        slug: target.slug,
        title: target.title,
        description: target.description,
        category: target.category,
        badge: peer.range,
        reason: peer.reason,
      })),
    },
    {
      id: "enhances",
      label: "Pairs well with",
      hint: "optional enhancers",
      icon: RELATED_ICONS.enhances,
      items: enhancesItems.map((s) => ({
        slug: s.slug,
        title: s.title,
        description: s.description,
        category: s.category,
      })),
    },
    {
      id: "siblings",
      label: `More in ${slice.category}`,
      hint: "same category",
      icon: RELATED_ICONS.siblings,
      items: siblingItems.map((s) => ({
        slug: s.slug,
        title: s.title,
        description: s.description,
        category: s.category,
      })),
    },
  ];

  const sourceHref = `https://github.com/rahmanef63/resource-site/tree/main/${slice.slicePath}`;

  return (
    <div className="space-y-6">
      <UseWideLayout />
      <SliceTitle slice={slice} />

      {slice.previewPath && (
        <SlicePreviewSection
          publicPath={slice.previewPath}
          adminPath={slice.adminPreviewPath}
          defaultSurface={slice.defaultSurface}
          defaultView={slice.defaultView ?? "desktop"}
          defaultZoom={slice.defaultZoom ?? 1}
          sourceHref={sourceHref}
        />
      )}

      <InstallCard slug={slice.slug} />

      <MetaCardsGrid slice={slice} />

      <ProvidersCard slice={slice} />

      {slice.agentRecipe && (
        <ShowcaseCard icon={Bot} label="Agent recipe">
          <p className="text-sm text-muted-foreground">{slice.agentRecipe}</p>
        </ShowcaseCard>
      )}

      <RelatedFeatures groups={relatedGroups} />

      <div className="flex flex-wrap items-center gap-2">
        <Button asChild variant="outline" size="sm">
          <Link href={sourceHref} target="_blank" rel="noreferrer">
            View source <ExternalLink className="size-3" />
          </Link>
        </Button>
        <Button asChild size="sm">
          <Link href="/slices">Back to catalog</Link>
        </Button>
      </div>
    </div>
  );
}
