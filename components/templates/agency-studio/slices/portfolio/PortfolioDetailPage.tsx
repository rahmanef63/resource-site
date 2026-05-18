"use client";

import {
  PortfolioDetailView,
  type PortfolioItem as SliceItem,
} from "@/features/portfolio-section";
import { useProject } from "../../shared/store";
import { PUBLIC_BASE } from "../../shared/nav-config";

/**
 * Hybrid wrapper: project detail via canonical PortfolioDetailView slice
 * (DRY+SSOT). Brief + Outcome flow into the new `sections` field (2-col).
 */
export function PortfolioDetailPage({ slug }: { slug: string }) {
  const p = useProject(slug);
  if (!p) {
    return (
      <PortfolioDetailView
        item={{
          id: "missing",
          slug: "missing",
          title: "Project not found",
          cover: { src: "", alt: "" },
        }}
        backHref={`${PUBLIC_BASE}/portfolio`}
      />
    );
  }
  const item: SliceItem = {
    id: p.id,
    slug: p.slug,
    title: p.title,
    summary: p.blurb,
    client: p.client,
    tags: [p.category, p.status],
    cover: { src: p.cover, alt: p.title },
    sections: [
      { id: "brief", heading: "Brief", body: p.brief },
      { id: "outcome", heading: "Outcome", body: p.outcome },
    ],
  };
  return (
    <PortfolioDetailView item={item} backHref={`${PUBLIC_BASE}/portfolio`} />
  );
}
