"use client";

import {
  PortfolioListSection,
  type PortfolioItem as SliceItem,
} from "@/features/portfolio-section";
import { useProjects } from "../../shared/store";
import { PUBLIC_BASE } from "../../shared/nav-config";

/**
 * Hybrid wrapper: reads live projects via useProjects() and feeds the
 * canonical PortfolioListSection slice (DRY+SSOT). Admin CRUD edits
 * propagate via the createTemplateStore BroadcastChannel.
 */
export function PortfolioListPage() {
  const projects = useProjects().filter((p) => p.status !== "archived");
  const items: SliceItem[] = projects.map((p) => ({
    id: p.id,
    slug: p.slug,
    title: p.title,
    summary: p.blurb,
    client: p.client,
    tags: [p.category],
    cover: { src: p.cover, alt: p.title },
  }));
  return (
    <PortfolioListSection
      eyebrow="Selected work"
      title="Recent client engagements"
      items={items}
      hrefFor={(i) => `${PUBLIC_BASE}/portfolio/${i.slug}`}
      layout="uniform"
      columns={3}
    />
  );
}
