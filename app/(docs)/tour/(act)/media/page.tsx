import { notFound } from "next/navigation";
import { acts, getAct } from "@/lib/content/tour";
import { getSlice } from "@/lib/content/slices";
import { ActHeader } from "@/components/site/tour/act-header";
import {
  SliceShowcase,
  type ShowcaseSlice,
} from "@/components/site/tour/slice-showcase";
import { LazySliceMount } from "@/components/site/tour/lazy-slice-mount";
import { CopyButton } from "@/components/site/copy-button";
import { Badge } from "@/components/ui/badge";

// Folder name MUST equal the act id so /tour/media resolves (mirror os-appshell).
const ACT_ID = "media";

export const metadata = {
  title: "Act III — Media | Grand Tour",
  description:
    "Create and view rich media in the browser: the layered image editor with 1-click background removal, the video-timeline NLE with realtime WebM export, the standalone canvas studio, the quick-look viewer, and the image picker + upload/storage adapter that feed them — each mounted live with its add recipe.",
};

/**
 * The Act III headline is image-editor — the layered raster editor whose
 * 1-click background removal (ONNX) is the single most impressive demo in the
 * act. It is FEATURED full-width above the sections via <LazySliceMount> (NOT an
 * iframe): image-editor is in PREVIEW_REGISTRY, not an iframe-route like
 * appshell, so its real widget mounts inline — but lazily (next/dynamic ssr:false
 * + IntersectionObserver), so the Konva + @imgly/background-removal (ONNX) chunk
 * only loads when it scrolls into view. The recipe is surfaced inline here (NOT
 * via SliceShowcase, which would re-render image-editor folded into a section).
 *
 * The remaining 5 slugs are grouped into two readable sections (curated order
 * from the tour recon). Heavy editors stay LAST in their section and either
 * registry-lazy (media-studio) or iframe-isolated (reel-editor) so the video-NLE
 * + canvas-studio chunks only load on scroll. A "More media" catch-all absorbs
 * any future media slug so nothing silently vanishes (audit:tour enforces a
 * total + disjoint partition against the live catalog).
 *
 * Per-slug mount (resolved inside SliceShowcase → Preview):
 *   • image-editor / media-viewer / media-studio / image-picker → in
 *     PREVIEW_REGISTRY → <LazySliceMount> (code-split-on-scroll)
 *   • reel-editor / files → no registry entry, have previewPath →
 *     <IframeThumbnail> (provider/document isolation, good for the heavy NLE)
 *   • all six are liveMount:true (none key-gated), so no capability cards here —
 *     but the SliceShowcase → CapabilityCard delegation still covers any future
 *     key-gated media slug automatically.
 */
const FEATURED = "image-editor";

const SECTIONS: { heading: string; blurb: string; slugs: string[] }[] = [
  {
    heading: "The editors",
    blurb:
      "The heavy hitters: the video-timeline NLE with realtime WebM export, and the standalone offline canvas studio. (The layered raster editor with 1-click background removal is featured above.)",
    slugs: ["reel-editor", "media-studio"],
  },
  {
    heading: "View & feed",
    blurb:
      "Look at and supply media: the quick-look viewer (image/video/audio/pdf), the one-button image picker (gallery/upload/Unsplash), and the storage-adapter upload resolver.",
    slugs: ["media-viewer", "image-picker", "files"],
  },
];

function toShowcase(slug: string, liveMount: boolean): ShowcaseSlice {
  const slice = getSlice(slug);
  return {
    slug,
    title: slice?.title ?? slug,
    recipe: `npx rahman-resources add ${slug}`,
    previewPath: slice?.previewPath,
    liveMount,
    // Copy for the static-fallback / capability-card variants (harmless for the
    // live slices here, future-proofs any backend-only or key-gated media slug).
    description: slice?.description,
    tagline: slice?.tagline,
  };
}

export default function MediaActPage() {
  const act = getAct(ACT_ID);
  if (!act) notFound();

  const i = acts.findIndex((a) => a.id === ACT_ID);
  const prev = i > 0 ? acts[i - 1] : null;
  const next = i < acts.length - 1 ? acts[i + 1] : null;

  // liveMount lookup keyed by slug, so curated order can diverge from catalog.
  const liveBySlug = new Map(act.sliceSlugs.map((s) => [s.slug, s.liveMount]));

  // FEATURED renders on its own above the sections — add it to `placed` so the
  // leftover catch-all never double-renders the centerpiece.
  const placed = new Set<string>([FEATURED, ...SECTIONS.flatMap((s) => s.slugs)]);
  const leftover = act.sliceSlugs.filter((s) => !placed.has(s.slug));

  const sections = [
    ...SECTIONS,
    ...(leftover.length > 0
      ? [
          {
            heading: "More media",
            blurb: "Additional media slices in this act.",
            slugs: leftover.map((s) => s.slug),
          },
        ]
      : []),
  ];

  const featured = getSlice(FEATURED);
  const featuredRecipe = `npx rahman-resources add ${FEATURED}`;

  return (
    <>
      <ActHeader act={act} prev={prev} next={next} />

      {/* The media centerpiece — the layered raster editor mounted LIVE inline
          via LazySliceMount (registry-backed, code-split). The Konva + ONNX
          background-removal chunk only loads when this scrolls into view. The
          recipe is surfaced inline (NOT via SliceShowcase, which would fold it
          into a section card). */}
      {liveBySlug.has(FEATURED) && (
        <section className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <div className="min-w-0 space-y-1">
              <h2 className="text-xl font-bold tracking-tight">
                1-click background removal, in the browser
              </h2>
              <p className="text-sm text-muted-foreground">
                {featured?.tagline ??
                  "A layered raster editor — layers, transform, paint, filters, layer styles, an AI command registry, and 1-click ONNX background removal that runs entirely client-side."}
              </p>
            </div>
            <Badge variant="outline" className="rounded-full text-[10px]">
              {FEATURED}
            </Badge>
            <code className="rounded bg-muted/50 px-2 py-1 font-mono text-xs text-muted-foreground">
              {featuredRecipe}
            </code>
            <CopyButton value={featuredRecipe} size="icon" className="h-7 w-7 shrink-0" />
          </div>
          <div className="overflow-hidden rounded-lg border bg-card">
            <LazySliceMount slug={FEATURED} />
          </div>
        </section>
      )}

      {sections.map((section) => (
        <section key={section.heading} className="space-y-4">
          <div className="space-y-1">
            <h2 className="text-xl font-bold tracking-tight">{section.heading}</h2>
            <p className="text-sm text-muted-foreground">{section.blurb}</p>
          </div>
          <div className="space-y-4">
            {section.slugs
              .filter((slug) => liveBySlug.has(slug))
              .map((slug) => (
                <SliceShowcase
                  key={slug}
                  {...toShowcase(slug, liveBySlug.get(slug) ?? true)}
                />
              ))}
          </div>
        </section>
      ))}
    </>
  );
}
