"use client";
/** Variant preview (VP wave) — rr-internal, stripped on `rr add`. */
import type { SlicePreviewModule } from "@/shared/preview/types";
import { PortfolioListSection, type PortfolioItem } from "./views/PortfolioListSection";

/** Inline SVG data URI — next/image treats data URIs as pre-optimized, so no
 *  remotePatterns config is needed for the preview surface. */
function swatch(hue: number): { src: string; alt: string } {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='400' height='300'><rect width='100%' height='100%' fill='hsl(${hue} 60% 55%)'/></svg>`;
  return { src: `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`, alt: "cover" };
}

const ITEMS: PortfolioItem[] = [
  { id: "1", slug: "brand-x", title: "Brand X identity", summary: "Full rebrand + web.", year: 2026, client: "Acme", tags: ["branding", "web"], cover: swatch(210) },
  { id: "2", slug: "motion-reel", title: "Motion reel", summary: "Kinetic title system.", year: 2025, client: "Studio", tags: ["motion"], cover: swatch(330) },
  { id: "3", slug: "ecom-revamp", title: "E-com revamp", summary: "Checkout redesign.", year: 2025, client: "Shoply", tags: ["ux"], cover: swatch(140) },
];

const preview: SlicePreviewModule = {
  PortfolioListSection: ({ variant }) => (
    <div className="p-4">
      <PortfolioListSection
        title="Selected work"
        items={ITEMS}
        hrefFor={(p) => `#${p.slug}`}
        layout={(variant.layout as "masonry" | "uniform" | "asymmetric") ?? "uniform"}
        columns={(Number(variant.columns) as 1 | 2 | 3) || 2}
        align={(variant.align as "left" | "center") ?? "left"}
        className="px-0 py-0"
      />
    </div>
  ),
};
export default preview;
